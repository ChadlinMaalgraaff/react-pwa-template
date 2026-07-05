/**
 * Google sign-in via the Cognito Hosted UI (OAuth2 Authorization Code flow).
 * We send the user to Cognito's /oauth2/authorize with identity_provider=Google;
 * Cognito redirects back to VITE_OAUTH_REDIRECT_URI with a `code` we hand to the backend.
 */

// CSRF guard: a random value sent as `state` and verified when Cognito redirects back.
const STATE_KEY = 'googleOAuthState'

/** Build the Cognito Hosted UI authorize URL that kicks off Google sign-in. */
export const buildGoogleAuthUrl = (state: string): string => {
  const params = new URLSearchParams({
    identity_provider: import.meta.env.VITE_GOOGLE_IDP_NAME || 'Google',
    response_type: 'code',
    client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
    scope: 'openid email profile',
    redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    state,
  })
  return `https://${import.meta.env.VITE_COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`
}

/** Generate + persist a state value, then send the browser to the Hosted UI. */
export const redirectToGoogleSignIn = (): void => {
  const state = crypto.randomUUID()
  sessionStorage.setItem(STATE_KEY, state)
  window.location.assign(buildGoogleAuthUrl(state))
}

/**
 * Validate the `state` returned by Cognito against the one we stored, consuming it
 * (single-use) regardless of outcome. Returns true only when they match.
 */
export const consumeOAuthState = (returnedState: string | null): boolean => {
  const stored = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)
  return stored !== null && returnedState !== null && stored === returnedState
}
