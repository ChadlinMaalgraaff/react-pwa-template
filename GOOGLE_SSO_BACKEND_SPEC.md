# Google SSO (Cognito) — Backend Implementation Spec

Add "Continue with Google" sign-in using **Amazon Cognito Hosted UI with Google as a
federated identity provider**, OAuth2 **Authorization Code** flow, **backend-mediated**
code→token exchange.

The **frontend is already implemented** (see [Frontend (done)](#frontend-done)). This
document specifies the **backend + AWS config work** that remains. The end result must be
that Google sign-in returns the **same token shape** the app already consumes for
password login, so nothing downstream changes.

---

## 1. Flow overview

```
User clicks "Continue with Google"
        │
        ▼
Frontend redirects browser to Cognito Hosted UI:
  https://<COGNITO_DOMAIN>/oauth2/authorize
    ?identity_provider=Google
    &response_type=code
    &client_id=<APP_CLIENT_ID>
    &scope=openid email profile
    &redirect_uri=<APP_ORIGIN>/auth/callback
    &state=<random csrf>
        │
        ▼
Cognito ↔ Google handshake (Cognito creates/looks up the pool user)
        │
        ▼
Cognito redirects to  <APP_ORIGIN>/auth/callback?code=<AUTH_CODE>&state=<csrf>
        │
        ▼
Frontend AuthCallback verifies `state`, then  POST /auth/google/callback { code }
        │
        ▼   ★ BACKEND WORK ★
Backend exchanges `code` at Cognito /oauth2/token (with client secret),
provisions the app user/profile on first login,
returns AuthResponse { accessToken, idToken, refreshToken, expiresIn, tokenType }
        │
        ▼
Frontend stores accessToken, calls GET /profile, routes the user in.
```

Why backend-mediated: it matches the existing pattern (the backend already brokers Cognito
tokens for password login), keeps the **app client secret server-side**, and gives a natural
home for **first-login provisioning** and **account linking**.

---

## 2. The one endpoint to implement

### `POST /auth/google/callback`

Exchanges a Cognito Hosted UI authorization code for tokens.

**Request body**
```json
{ "code": "<authorization code from Cognito redirect>" }
```

**Response `200` — must match the existing `AuthResponse` shape exactly**
```json
{
  "accessToken": "string",
  "idToken": "string",
  "refreshToken": "string",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```
This is the identical contract used by `POST /auth/login` today — reuse the same response
model/serializer.

**Errors**
- `400` — missing/invalid `code`, or Cognito token exchange rejects it (expired/already used).
- `401`/`403` — exchange succeeded but the user is not permitted (e.g. disabled).
- `502`/`503` — Cognito unreachable.

The frontend treats any non-2xx as "Could not complete Google sign-in" and returns the user
to `/login`, so a clear message is helpful but not parsed.

### Implementation steps

1. **Exchange the code** — `POST https://<COGNITO_DOMAIN>/oauth2/token`
   (`Content-Type: application/x-www-form-urlencoded`):
   ```
   grant_type=authorization_code
   client_id=<APP_CLIENT_ID>
   code=<code from request>
   redirect_uri=<APP_ORIGIN>/auth/callback   # MUST byte-for-byte match the authorize redirect_uri
   ```
   - If the app client has a secret (recommended), authenticate with HTTP Basic:
     `Authorization: Basic base64(client_id:client_secret)` (do **not** also send client_id in the body when using Basic, per Cognito docs — follow whichever your client config requires).
   - Cognito returns `{ access_token, id_token, refresh_token, expires_in, token_type }`.

2. **Validate & decode the `id_token`** (JWKS at
   `https://cognito-idp.<region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`).
   Extract `sub`, `email`, `email_verified`, `name`, and the IdP (`identities` claim →
   `providerName: "Google"`).

3. **Provision the app user on first login** (see §4).

4. **Return** the tokens mapped into the `AuthResponse` shape (snake_case → camelCase:
   `access_token`→`accessToken`, `expires_in`→`expiresIn`, etc.).

> Note: the Google **`code` is single-use**. The frontend guards against double-submission
> (React StrictMode), but make the handler idempotent enough that a duplicate call fails
> cleanly with `400` rather than 500.

---

## 3. AWS / Cognito configuration (one-time, no app code)

1. **Google Cloud Console** → create an **OAuth 2.0 Client ID (Web application)**:
   - Authorized redirect URI: `https://<COGNITO_DOMAIN>/oauth2/idpresponse`
   - Save the **Client ID** and **Client Secret**.

2. **Cognito User Pool** → **Identity providers** → add **Google**:
   - Paste Google Client ID + Secret.
   - Authorized scopes: `openid email profile`.
   - Attribute mapping: Google `email` → pool `email`, `name` → `name`, `sub` →
     (subject). Map enough to satisfy required pool attributes.

3. **Cognito Hosted UI domain** — ensure a domain exists
   (`<COGNITO_DOMAIN>`, e.g. `your-app.auth.<region>.amazoncognito.com` or a custom domain).

4. **App client** settings:
   - **Allowed OAuth flows:** Authorization code grant.
   - **Allowed OAuth scopes:** `openid`, `email`, `profile`.
   - **Identity providers:** enable **Cognito user pool** *and* **Google**.
   - **Callback URLs:** `<APP_ORIGIN>/auth/callback` (add every env: local, staging, prod).
   - **Sign-out URLs:** `<APP_ORIGIN>/login` (or your chosen post-logout page).
   - Prefer a client **with a secret** for the backend exchange.

5. The API's existing **JWT/resource-server validation is unchanged** — same issuer,
   same JWKS. Federated users get tokens from the same pool.

---

## 4. First-login provisioning (required)

Google users **never hit `POST /auth/register`**, so the app's own user/profile row will not
exist on first sign-in. The backend must create it lazily.

On `POST /auth/google/callback` (or via a Cognito **Post-Confirmation / Pre-Token-Generation
Lambda**), after decoding the id_token:

- **Upsert** the app user keyed by Cognito `sub` (preferred) or verified `email`.
- Populate `email`, `name` from the token.
- Assign the **default role** (`user`) — never trust a client-supplied role.
- Anything `GET /profile` requires (the frontend calls it immediately after login) must be
  present, or `/profile` must create-on-read.

If provisioning fails, return non-2xx so the frontend shows the sign-in error rather than
landing a half-provisioned user.

---

## 5. Account linking (important gotcha)

A user who **registered with email/password** and **later signs in with Google using the same
email** will, by default, become a **second, separate Cognito user**. To merge them into one
identity:

- Use a Cognito **Pre-Signup Lambda trigger** that, when a federated sign-up arrives for an
  email that already exists as a native user, calls
  **`AdminLinkProviderForUser`** to link the Google identity to the existing user.
- Only auto-link when `email_verified` is true (both sides) to avoid account-takeover via
  unverified emails.

Decide the policy explicitly: auto-link verified emails, or force the user to sign in with
their original method first. Document whichever you choose.

---

## 6. Environment / secrets the backend needs

| Name | Example | Notes |
|------|---------|-------|
| `COGNITO_REGION` | `eu-west-1` | |
| `COGNITO_USER_POOL_ID` | `eu-west-1_abc123` | |
| `COGNITO_DOMAIN` | `your-app.auth.eu-west-1.amazoncognito.com` | no scheme |
| `COGNITO_APP_CLIENT_ID` | `xxxxxxxx` | same client the frontend uses |
| `COGNITO_APP_CLIENT_SECRET` | `••••` | **secret**, server-side only |
| `OAUTH_REDIRECT_URI` | `https://app.example.com/auth/callback` | must match the authorize call byte-for-byte |

The `redirect_uri` used in the token exchange **must be identical** to the one the frontend
used in the authorize request and one of the app client's registered Callback URLs, or
Cognito rejects the exchange.

---

## 7. Security checklist

- App client secret stays **server-side only**.
- Validate the `id_token` signature, `iss`, `aud` (= app client id), and `exp`.
- The `state` CSRF check is done on the frontend (sessionStorage, single-use); the backend
  does not need to track `state`.
- Treat the authorization `code` as single-use; reject reuse with `400`.
- Only auto-link accounts on verified emails.
- Default role assigned server-side; ignore any client-supplied role/claims for authorization.

---

## 8. Optional: sign-out

To clear the Hosted UI session (otherwise the next "Continue with Google" can silently
re-sign-in the same Google account), the frontend can redirect to
`https://<COGNITO_DOMAIN>/logout?client_id=<APP_CLIENT_ID>&logout_uri=<APP_ORIGIN>/login`.
No backend work required; mentioned for completeness. (Not yet wired on the frontend.)

---

## Frontend (done)

Already implemented in this repo — the backend only needs to satisfy the contract above.

| Piece | Location | Behaviour |
|-------|----------|-----------|
| OAuth redirect + state | `src/utils/googleAuth.ts` | Builds the `/oauth2/authorize` URL, stores a single-use `state` in `sessionStorage`, redirects the browser. |
| API call | `src/services/auth.service.ts` → `loginWithGoogleCode(code)` | `POST /auth/google/callback` with `{ code }`, expects `AuthResponse`. |
| Callback route/page | `src/components/pages/AuthCallback/AuthCallback.tsx` at route `/auth/callback` (`src/App.tsx`) | Verifies `state`, handles `?error=`, exchanges the code, then completes login. Spinner while working, friendly error + "Back to login" on failure. Guarded against StrictMode double-run. |
| Shared post-login | `src/hooks/useCompleteLogin.ts` | `setToken → GET /profile → setUser → route by role/onboarding`. Used by both password login and Google. |
| Buttons | `src/components/pages/Login/Login.tsx`, `Register.tsx` | "Continue with Google". |
| Config | `.env.example`, `src/vite-env.d.ts` | `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, `VITE_OAUTH_REDIRECT_URI`, `VITE_GOOGLE_IDP_NAME`. |

**Existing `AuthResponse` shape the backend must return** (`src/services/auth.service.ts`):
```ts
interface AuthResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}
```

After a successful exchange the frontend calls **`GET /profile`** and routes by
`profile.role` (`admin` → `/admin`, else onboarding/`/staples`/`/how-it-works`) — so that
endpoint must return a valid profile for a freshly provisioned Google user.

---

## Definition of done (backend)

- [ ] Cognito pool has Google IdP + Hosted UI domain + app client (code grant, callback `/auth/callback`).
- [ ] `POST /auth/google/callback` exchanges the code and returns the exact `AuthResponse` shape.
- [ ] First-login provisioning creates the app user/profile with default role.
- [ ] `GET /profile` works for a brand-new Google user immediately after exchange.
- [ ] Account-linking policy implemented (or explicitly deferred and documented).
- [ ] Secrets configured; `redirect_uri` matches between authorize, token exchange, and app client config.
