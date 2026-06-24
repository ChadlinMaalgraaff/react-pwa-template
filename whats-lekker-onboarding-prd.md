# PRD: "How it works" Onboarding Carousel + App Rename

**Owner:** Product  
**Status:** Ready for implementation  
**Applies to:** Post-login flow (new users); all UI surfaces carrying the app name

---

## 1. Summary

Two linked changes:

1. **App rename** — the display name changes from *PantryPal* to **What's Lekker?** across every surface a user sees. Code, routes, component names, and package identifiers are not touched.
2. **Onboarding carousel** — a full-screen "How it works" slideshow shown once to a user immediately after their first successful login. Three slides, each with an illustration, a headline, a short body, and a persistent **Skip** button. After the final slide a **Let's go** CTA replaces Skip.

---

## 2. App rename — What's Lekker?

### 2.1 Rationale
"What's Lekker?" is distinctly South African slang for "what's good/delicious?", immediately signals the food domain, and sets a warm, approachable tone that resonates with the target market.

### 2.2 Surfaces to update

| Surface | Current text | New text |
|---|---|---|
| Browser tab / HTML `<title>` | `PantryPal` | `What's Lekker?` |
| PWA manifest `name` | `PantryPal` | `What's Lekker?` |
| PWA manifest `short_name` | `PantryPal` | `Lekker` |
| Login screen wordmark (`auth-logo`) | `PantryPal` | `What's Lekker?` |
| Register screen wordmark (`auth-logo`) | `PantryPal` | `What's Lekker?` |
| App shell header (desktop/wide) | `PantryPal` | `What's Lekker?` |
| Any in-copy references (e.g. "Welcome to PantryPal") | — | Update accordingly |

### 2.3 What does NOT change
- File names, component names, CSS class names, route paths, package.json `name`.
- Backend API or auth tokens.
- Any test assertions not directly testing user-visible copy.

---

## 3. Onboarding carousel — "How it works"

### 3.1 Trigger & visibility logic
- Show **once per user account**, immediately after the first successful login response.
- Persist completion state client-side (e.g. `localStorage` key `onboarding_seen_v1`). Key is versioned so a future slide-set update can re-trigger the carousel.
- If the user dismisses via **Skip** or completes the carousel, the flag is written and the carousel never appears again on any subsequent login (same device or after clearing cache should re-show; that is acceptable).
- Do **not** show on the Register screen — wait for the post-login redirect.

### 3.2 Layout & interaction

```
┌─────────────────────────────────────┐
│  [slide illustration — full width]  │
│                                     │
│  ● ○ ○   [progress dots]           │
│                                     │
│  Headline                           │
│  Body copy (2–3 short sentences)    │
│                                     │
│  [CTA button — full width]          │
│        Skip (slides 1–2)            │
│        Let's go (slide 3)           │
└─────────────────────────────────────┘
```

- Full-screen overlay rendered above the home screen.
- Swipe left/right supported (touch).
- Progress dots indicate current position.
- **Skip** appears on slides 1–2, dismisses the carousel immediately.
- **Let's go** on slide 3 completes the carousel and navigates the user to the dashboard.
- No back navigation required (swipe left achieves this).
- The app name **What's Lekker?** should appear subtly on slide 1 (e.g. as part of the welcome framing).

### 3.3 The three slides

---

#### Slide 1 — Snap your fridge

**Headline:** Just take a photo of your fridge  
**Body:** Open the camera, snap a quick pic of your fridge or whatever food you've got at home, and What's Lekker? picks everything up automatically. No typing, no long lists — just a photo and you're sorted.  
**Illustration theme:** A hand holding a phone over an open fridge or a spread of fresh SA produce; soft glowing mint-green bounding-box rectangles automatically highlight items (tomatoes, mince, butternut, milk, leafy greens) as if being detected in real time.

---

#### Slide 2 — Cook Now

**Headline:** See what you can cook right now  
**Body:** Tap **Cook Now** and we'll show you recipes you can actually make today — using only the food you've already got at home. No extra shopping needed, no wasted ingredients.  
**Illustration theme:** A phone screen showing 3–4 matched recipe cards (bobotie, stir-fry, pasta) with a bold green "Ready to cook" badge on the top card and a partial match indicator on the others; a pot on a hob in the soft-focus background suggests a meal in progress.

---

#### Slide 3 — Browse Recipes

**Headline:** Find something lekker to make  
**Body:** Browse hundreds of South African and international recipes — from quick weeknight meals to braai classics. Filter by how much time you've got, the type of meal you're after, or see what's on special near you this week.  
**Illustration theme:** A phone screen showing a recipe browse grid — 2 × 3 cards — with vibrant food thumbnails of recognisable SA dishes: bobotie with golden crust, braai ribs, pap with tomato relish, malva pudding. Colourful illustrated filter chips float above the grid. Warm, editorial, food-magazine energy.

---

### 3.4 Copy tone
- Warm, direct, colloquial — like a knowledgeable friend, not a corporate product.
- Use "you / your" throughout.
- Avoid jargon ("pantry items", "AI image recognition") — favour "what you've got", "your fridge", "snap a photo".
- Short sentences; nothing over 20 words per body line.

---

## 4. Slide illustrations — ready to use

All three images have been generated and are committed to the repository. They are served as static assets via Vite's `public/` directory and are available at the following paths at runtime:

| Slide | File | Runtime URL |
|---|---|---|
| 1 — Snap your fridge | `public/onboarding/slide_1.png` | `/onboarding/slide_1.png` |
| 2 — Cook Now | `public/onboarding/slide_2.png` | `/onboarding/slide_2.png` |
| 3 — Browse Recipes | `public/onboarding/slide_3.png` | `/onboarding/slide_3.png` |

Reference them in the carousel component as plain `<img src="/onboarding/slide_1.png" />` — no import required.

---

## 5. Acceptance criteria

- [ ] Carousel appears immediately after the first successful login and not again on subsequent logins (same device).
- [ ] Skip button on slides 1–2 dismisses the carousel without further navigation.
- [ ] Let's go on slide 3 navigates to the dashboard.
- [ ] Progress dots update correctly as the user swipes or taps through.
- [ ] Swipe gestures work on mobile (touch).
- [ ] All three slides render the correct headline and body copy from §3.3.
- [ ] The app name reads **What's Lekker?** on the login screen, register screen, browser tab, and PWA install prompt.
- [ ] No regressions in existing tests; new component has its own tests.
- [ ] Lint passes at zero warnings.

---

## 6. Out of scope

- Personalisation of slides based on user role or region.
- Analytics events on slide impressions (can be added later).
- Re-showing the carousel when the user updates their profile.
- Changes to backend or auth flows.
