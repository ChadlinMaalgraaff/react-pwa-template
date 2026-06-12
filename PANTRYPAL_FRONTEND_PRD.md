# PantryPal — Frontend PRD

## HOW TO USE THIS FILE

This document specifies the PantryPal frontend, built on top of this `pwa` template (React 18 + TypeScript + Vite + Redux Toolkit + React Router + Tailwind, per `FRONTEND_CODING_STANDARDS.md` and `COMPONENT_STRUCTURE.md`). It has two audiences:

1. **Claude (Figma design generation)** — [Section 5](#5-design-system-foundations) (tokens), [Section 7](#7-shared-component-library) (component inventory), and [Sections 8–9](#8-customer-screens-mobile-first) (screen catalogs with layout/content descriptions) contain everything needed to generate a Figma file: design tokens, a component library, and one frame per screen per breakpoint listed in [Section 6](#6-information-architecture--route-map).
2. **An implementation agent** (building the app, with the Figma file as the visual reference) — every section, especially [Section 10](#10-state-management) (Redux/hooks), [Section 11](#11-api-service-layer) (service files mapped to backend endpoints), [Section 12](#12-user-journeys--screen-flows) (flows), [Section 14](#14-figma-design-brief) is irrelevant to this audience and can be skipped, and [Section 15](#15-agent-implementation-instructions) (step-by-step build order).

**Recommended order of operations:**
1. Feed this file + [Section 5](#5-design-system-foundations)/[7](#7-shared-component-library)/[8](#8-customer-screens-mobile-first)/[9](#9-adminbackoffice-screens-desktop-only) to Claude to generate the Figma design (tokens → components → screens).
2. Once the Figma design exists, feed this file + the Figma file to the implementation agent, which follows [Section 15](#15-agent-implementation-instructions).

---

## 1. Document Metadata

| Field | Value |
|---|---|
| Project | PantryPal |
| Document | Frontend PRD |
| Version | 1.0 |
| Date | 2026-06-13 |
| Status | Ready for Figma generation + implementation |

---

## 2. Reference Documents

| Document | Location | Purpose |
|---|---|---|
| `PRODUCT_OVERVIEW.md` | `../../Backend/sam-lambdas/PRODUCT_OVERVIEW.md` | Product spec — features, concepts, user journeys (§8). Source of truth for *what* PantryPal does. |
| `PANTRYPAL_BACKEND_PRD.md` | `../../Backend/sam-lambdas/PANTRYPAL_BACKEND_PRD.md` | Backend API contract — every endpoint, request/response shape, and DB schema this frontend talks to. Section 11 below maps 1:1 onto its Section 7 (Active Lambda Catalog). |
| `PANTRYPAL_FRONTEND_PRD.md` | this file | Source of truth for screens, components, state, and Figma generation. |
| `FRONTEND_CODING_STANDARDS.md` | this repo root | TypeScript/React/Redux conventions — all new code follows this. |
| `COMPONENT_STRUCTURE.md` | this repo root | Folder layout, path aliases, component file conventions. |
| `PWA_SETUP.md` | this repo root | Service worker / manifest setup — see [Section 13](#13-pwa-considerations). |

If the frontend and backend repos are deployed/handed off separately, copy `PRODUCT_OVERVIEW.md` and `PANTRYPAL_BACKEND_PRD.md` into this repo's root so the relative paths above resolve.

---

## 3. Project Overview & App Shell Strategy

PantryPal's frontend is **one PWA, two shells**, selected by the authenticated user's role (`UserProfile.role` / Cognito `Admins` group membership — see `PANTRYPAL_BACKEND_PRD.md` §5):

| Shell | Audience | Layout | Breakpoint target |
|---|---|---|---|
| **Customer Shell** | regular users (`role: 'user'`) | Mobile-first, bottom tab navigation, single-column | 360–428px primary; fluid up to tablet (no desktop-specific layout required per `PRODUCT_OVERVIEW.md` §3 — "mobile-responsive", not desktop-optimized) |
| **Admin Shell** | admins (`role: 'admin'`) | Desktop sidebar + header (reuses this template's existing `Layout`/`Sidebar`/`Header` components as-is) | 1280px+ only — desktop-only per `PRODUCT_OVERVIEW.md` §3, no mobile layout required |

Both shells share: the design system ([Section 5](#5-design-system-foundations)), the shared component library ([Section 7](#7-shared-component-library)), the API service layer ([Section 11](#11-api-service-layer)), and the auth flow (login/register screens are shell-agnostic — full-width centered forms that work at any size).

**Routing:** after login, `App.tsx` reads `user.role` from the `auth` slice and renders either `<CustomerShell>` (new — bottom-nav layout, built per [Section 7.1](#71-layout--navigation)) or `<Layout>` (existing admin sidebar layout, reused) as the route element wrapping the relevant route group. Unauthenticated routes (`/login`, `/register`) render outside either shell.

---

## 4. Tech Stack & Conventions

No new major dependencies are required — the existing stack covers every PantryPal requirement:

| Concern | Library (already in `package.json`) | Notes |
|---|---|---|
| Framework | React 18 + TypeScript + Vite | unchanged |
| Routing | `react-router-dom` v6 | unchanged; new route tree per [Section 6](#6-information-architecture--route-map) |
| Global state | `@reduxjs/toolkit` + `react-redux` | unchanged pattern — slices in `src/store/slices/`, typed hooks via `src/hooks/redux.hooks.ts` |
| HTTP | `axios` via `src/services/api-client.ts` | unchanged — `ApiClient` singleton with JWT interceptor already present |
| Styling | Tailwind CSS + per-component `.css` | unchanged — extend `tailwind.config.ts` per [Section 5.1](#51-color-tokens) |
| Forms | plain controlled components + local state | no form library needed — forms in this app are short (login, item quantity, admin CRUD) |
| Camera/photo capture | native `<input type="file" accept="image/*" capture="environment">` | no camera library needed — works on mobile browsers and falls back to file picker on desktop (used by Admin for special/recipe images too) |
| Testing | `vitest` + `@testing-library/react` | unchanged — every new component/hook/service ships with a test per `FRONTEND_CODING_STANDARDS.md` |

**New conventions introduced for PantryPal** (additive, do not change existing patterns):

- **Per-domain service files** in `src/services/`, one per backend domain group from `PANTRYPAL_BACKEND_PRD.md` §7 (e.g. `pantry.service.ts`, `recipe.service.ts`) — same class-singleton pattern as the existing `auth.service.ts`. See [Section 11](#11-api-service-layer) for the full list.
- **Per-domain data hooks** in `src/hooks/`, following the `useFetchUsers` pattern from `FRONTEND_CODING_STANDARDS.md` (local `useState` for `data`/`isLoading`/`error`, no extra state library) — e.g. `usePantry()`, `useRecipeMatch()`. These wrap the service calls; components never call services directly.
- **Redux slices** are reserved for state that is genuinely global/cross-screen: `auth` (existing), `ui` (existing, for notifications), and a new `pantry` slice holding just the pantry **item count** (for the bottom-nav badge) — everything else (recipe lists, specials, shopping list contents) is screen-local via the data hooks above. This keeps Redux lean per the "efficient" goal.
- **Money formatting**: add `formatCurrency(value: number): string` to `src/utils/helpers.ts` — `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`. Used everywhere a `price`/`total` from the backend is displayed.

---

## 5. Design System Foundations

These tokens are the input for Figma generation — define them as Tailwind theme extensions in `tailwind.config.ts` (additive to the existing `primary`/`secondary`/`accent` keys) and as Figma local styles/variables with matching names.

### 5.1 Color Tokens

PantryPal's palette signals "fresh ingredients + savings"

| Token | Hex | Usage |
|---|---|---|
| `primary` |  | Primary actions, "makeable" recipe badges, success states, nav active state |
| `primary-light` |  | Primary backgrounds (chips, makeable recipe card background) |
| `secondary` |  | Secondary actions, links |
| `accent` | | Specials/deals badges, "save money" highlights, price callouts |
| `accent-light` | | Special card backgrounds |
| `danger` |  | Delete actions, errors, "missing ingredient" indicators |
| `neutral-50`…`neutral-900` | (Tailwind `stone` scale) | Backgrounds, text, borders — warm gray rather than cool gray to match the food theme |
| `surface` |  | Card/sheet backgrounds |


### 5.2 Typography

| Token | Font | Sizes (Tailwind scale) | Usage |
|---|---|---|---|
| `font-sans` | Inter (system fallback: `-apple-system, sans-serif`) | — | All UI text |
| Display | 700 weight | `text-2xl`/`text-3xl` (24/30px) | Screen titles ("Your Pantry", "What can I make?") |
| Heading | 600 weight | `text-lg`/`text-xl` (18/20px) | Card titles, recipe names, section headers |
| Body | 400 weight | `text-base`/`text-sm` (16/14px) | Body copy, ingredient names, list items |
| Caption | 400 weight | `text-xs` (12px) | Helper text, timestamps, "valid until" dates |
| Price | 700 weight | `text-lg`/`text-xl`, `accent` color | All ZAR amounts |

### 5.3 Spacing, Radius, Elevation

| Token | Value | Usage |
|---|---|---|
| Base spacing unit | `4px` (Tailwind default scale) | All padding/margin |
| Card radius | `rounded-xl` (12px) | Cards, sheets, modals |
| Pill/chip radius | `rounded-full` | Ingredient chips, badges, filter pills |
| Card elevation | `shadow-sm` (default), `shadow-md` (active/pressed) | Cards on `surface` over `neutral-50` background |
| Touch target minimum | `44px` height | All buttons/tap targets (mobile accessibility) |

### 5.4 Iconography

Use a single open-source icon set for consistency — **Lucide** (MIT, matches Tailwind ecosystem conventions, not yet a dependency — add `lucide-react` when implementation begins). Icons needed (non-exhaustive, expand as screens require):

`home`, `package` (pantry), `chef-hat` (recipes), `tag` (specials), `shopping-cart`, `user` (profile), `camera`, `upload`, `plus`, `minus`, `trash-2`, `check`, `check-circle`, `x`, `search`, `filter`, `chevron-right`, `chevron-down`, `map-pin`, `clock`, `users` (servings), `alert-circle`, `edit-2`, `settings`, `log-out`.

### 5.5 Breakpoints

| Name | Width | Shell |
|---|---|---|
| `mobile` | 375px (design reference: iPhone 12/13/14) | Customer Shell — primary design target |
| `tablet` | 768px | Customer Shell — fluid scaling, no distinct layout |
| `desktop` | 1280px | Admin Shell — primary (and only) design target |

For Figma: generate Customer screens at the `mobile` (375×812) frame size, and Admin screens at the `desktop` (1280×800) frame size.

---

## 6. Information Architecture / Route Map

### 6.1 Public Routes (no shell, no auth)

| Route | Screen | Notes |
|---|---|---|
| `/login` | [Login](#login) | Redirects to `/pantry` (user) or `/admin` (admin) on success, based on role from `GET /profile`. |
| `/register` | [Register](#register) | On success, proceeds to `/onboarding`. |
| `/onboarding` | [Onboarding](#onboarding) | One-time post-registration preferences step. Skippable. |

### 6.2 Customer Shell Routes (`role: 'user'`, mobile-first, bottom tab nav)

Bottom nav has 5 tabs: **Pantry**, **Recipes**, **Specials**, **Lists**, **Profile**. Routes not listed as a tab are pushed on top of a tab (back button, no bottom nav change).

| Route | Screen | Tab | Notes |
|---|---|---|---|
| `/pantry` | [Pantry](#pantry) | Pantry (default/index) | |
| `/pantry/capture` | [Photo Capture](#photo-capture) | (pushed from Pantry) | Full-screen, no bottom nav |
| `/pantry/capture/review` | [Photo Review & Confirm](#photo-review--confirm) | (pushed from Photo Capture) | Full-screen, no bottom nav |
| `/recipes` | [Recipe Match ("Cook Now")](#recipe-match-cook-now) | Recipes (default/index) | Default tab view — ranked matches |
| `/recipes/browse` | [Recipe Browse](#recipe-browse) | Recipes (secondary view, segmented control) | |
| `/recipes/:id` | [Recipe Detail](#recipe-detail) | (pushed from either Recipes view) | Includes cost breakdown as an expandable section, not a separate route |
| `/specials` | [Specials Browse](#specials-browse) | Specials | |
| `/shopping-lists` | [Shopping Lists](#shopping-lists) | Lists (default/index) | |
| `/shopping-lists/:id` | [Shopping List Detail](#shopping-list-detail) | (pushed from Lists) | |
| `/profile` | [Profile & Settings](#profile--settings) | Profile | |

### 6.3 Admin Shell Routes (`role: 'admin'`, desktop sidebar — reuses existing `Layout`/`Sidebar`/`Header`)

| Route | Screen | Sidebar Section |
|---|---|---|
| `/admin` | [Admin Dashboard](#admin-dashboard) | Dashboard |
| `/admin/ingredients` | [Ingredient Catalog](#ingredient-catalog) | Catalog |
| `/admin/recipes` | [Recipe Management](#recipe-management) | Recipes |
| `/admin/recipes/new` | [Recipe Editor](#recipe-editor) | (pushed from Recipe Management) |
| `/admin/recipes/:id/edit` | [Recipe Editor](#recipe-editor) | (pushed from Recipe Management) |
| `/admin/recipes/import` | [Recipe Import](#recipe-import) | (pushed from Recipe Management) |
| `/admin/retailers` | [Retailer & Store Management](#retailer--store-management) | Retailers |
| `/admin/specials` | [Weekly Specials Management](#weekly-specials-management) | Specials |
| `/admin/specials/upload` | [Specials Upload](#specials-upload) | (pushed from Weekly Specials Management) |
| `/admin/users` | [User Management](#user-management) | Users |

### 6.4 Route Guards

- `ProtectedRoute` (new, `src/components/shared/ProtectedRoute/ProtectedRoute.tsx`): redirects to `/login` if `auth.isAuthenticated` is false. Wraps both shells.
- `AdminRoute` (new, same folder pattern): redirects to `/pantry` if `auth.user.role !== 'admin'`. Wraps the Admin Shell route group only — prevents a regular user from reaching `/admin/*` even via direct URL.
- A logged-in admin can still navigate to `/pantry` etc. (e.g. to test the customer experience) — only the reverse (user → `/admin/*`) is blocked.

---

## 7. Shared Component Library

All new components follow `COMPONENT_STRUCTURE.md`: own folder under `src/components/shared/<Name>/`, `<Name>.tsx` + `<Name>.css`, exported from `src/components/shared/index.ts`, with a matching `__tests__/<Name>.test.tsx` and a Storybook story in `src/stories/`. This is the component inventory for Figma generation — every entry below should become a Figma component (with variants where noted).

### 7.1 Layout & Navigation

| Component | Location | Description | Variants |
|---|---|---|---|
| `CustomerShell` | `components/layout/CustomerShell/` | New. Mobile app shell: top bar (screen title + contextual action icon) + `<Outlet>` + `BottomNav`. | — |
| `BottomNav` | `components/layout/BottomNav/` | New. Fixed bottom tab bar, 5 items (Pantry, Recipes, Specials, Lists, Profile), active-state via `primary` color + filled icon. Badge dot on "Lists" tab when shopping list has unchecked items (optional polish). | default, active item |
| `Layout` / `Header` / `Sidebar` | `components/layout/Layout/`, `Header/`, `Sidebar/` | **Existing — reused as-is** for the Admin Shell. Sidebar items updated to the Admin route list ([6.3](#63-admin-shell-routes-role-admin-desktop-sidebar--reuses-existing-layoutsidebarheader)). | — |
| `ProtectedRoute`, `AdminRoute` | `components/shared/ProtectedRoute/`, `AdminRoute/` | New. Route guard wrappers per [6.4](#64-route-guards). No visual component — not part of the Figma file. | — |

### 7.2 Core UI Primitives

| Component | Location | Description | Variants |
|---|---|---|---|
| `Button` | `components/shared/Button/` | **Existing — reused.** | primary, secondary, danger, sizes sm/md/lg, loading |
| `Card` | `components/shared/Card/` | **Existing — reused** as the base for `RecipeCard`/`SpecialCard`/etc. | — |
| `Input` | `components/shared/Input/` | **Existing — reused** for text/number/email/password fields. | with label, with error |
| `Select` | `components/shared/Select/` | New. Native `<select>` styled to match `Input` — used for unit pickers, retailer filters, role dropdowns. | — |
| `SearchBar` | `components/shared/SearchBar/` | New. `Input` with leading search icon + debounced `onChange` (300ms) — used for ingredient/recipe/specials search. | with filter button |
| `Badge` | `components/shared/Badge/` | New. Small rounded label — "Makeable", "On Special", "Admin", role tags. | success (green), accent (amber), neutral, danger |
| `Chip` | `components/shared/Chip/` | New. Pill-shaped, used for ingredient tags, dietary preferences, retailer filter toggles. | default, selected, removable (with × icon) |
| `Modal` | `components/shared/Modal/` | New. Centered dialog (desktop) — used in Admin Shell for create/edit forms. | — |
| `BottomSheet` | `components/shared/BottomSheet/` | New. Slide-up sheet from screen bottom (mobile) — used for "Add Pantry Item", "Add to Shopping List", quantity edits. | — |
| `EmptyState` | `components/shared/EmptyState/` | New. Icon + message + optional CTA button — "Your pantry is empty", "No specials right now", "No recipes match yet". | — |
| `Spinner` | `components/shared/Spinner/` | New. Loading indicator — full-screen (route transitions) and inline (button loading, already in `Button`). | full-screen, inline |
| `Toast` | `components/shared/Toast/` | New. Renders `ui.notification` from the existing `ui` slice as a dismissible toast (success/error/warning/info). | success, error, warning, info |
| `QuantityStepper` | `components/shared/QuantityStepper/` | New. `−` / value / `+` control for pantry item and shopping list item quantities. | — |
| `ProgressSteps` | `components/shared/ProgressSteps/` | New. Horizontal step indicator — used in Onboarding and Photo Capture → Review flow (2–3 steps). | — |
| `Tabs` (segmented control) | `components/shared/Tabs/` | New. Used for "Cook Now / Browse" toggle on Recipes tab and "Active / All" toggle on Admin Specials. | — |
| `ConfirmDialog` | `components/shared/ConfirmDialog/` | New. Generic "Are you sure?" modal for destructive actions (delete pantry item, delete recipe, etc.). | — |

### 7.3 Pantry Components

| Component | Location | Description |
|---|---|---|
| `PantryItemRow` | `components/pantry/PantryItemRow/` | List row: ingredient name, category icon, `QuantityStepper`, delete icon. Used on [Pantry](#pantry). |
| `IngredientAutocomplete` | `components/pantry/IngredientAutocomplete/` | `SearchBar` + dropdown list, calls `GET /ingredients?search=`, supports "create new" fallback (free-text → `ingredientName`). Used on Pantry "Add item" sheet and Admin recipe/specials forms. |
| `PhotoCaptureFrame` | `components/pantry/PhotoCaptureFrame/` | Full-screen camera/upload UI — wraps the native file input, shows preview + "Use Photo"/"Retake" actions. Used on [Photo Capture](#photo-capture). |
| `SuggestionReviewRow` | `components/pantry/SuggestionReviewRow/` | One AI-suggested ingredient: editable name (if `matchedExisting: false`), `QuantityStepper`, confidence indicator (low-confidence visual flag), remove icon. Used on [Photo Review & Confirm](#photo-review--confirm). |

### 7.4 Recipe Components

| Component | Location | Description |
|---|---|---|
| `RecipeCard` | `components/recipes/RecipeCard/` | `Card` with image, title, cuisine/time/servings meta row, and a match `Badge` (`"Makeable"` / `"Missing 2"`). Used on Recipe Match, Recipe Browse, and Admin Recipe Management (without match badge). |
| `RecipeIngredientRow` | `components/recipes/RecipeIngredientRow/` | Ingredient name, quantity/unit, `inPantry` check icon or "missing" indicator. Used on [Recipe Detail](#recipe-detail). |
| `CostBreakdownPanel` | `components/recipes/CostBreakdownPanel/` | Expandable section on Recipe Detail showing `cheapestSingleRetailer`, `cheapestCombination`, and per-ingredient `RetailerOfferRow` list. |
| `RetailerOfferRow` | `components/recipes/RetailerOfferRow/` | Retailer logo/name, item name, price (`accent` color), "valid until" date. Used inside `CostBreakdownPanel` and [Specials Browse](#specials-browse). |

### 7.5 Specials Components

| Component | Location | Description |
|---|---|---|
| `SpecialCard` | `components/specials/SpecialCard/` | `Card` variant: special image, item name, retailer `Badge`, price (`accent`), valid date range. Used on [Specials Browse](#specials-browse). |
| `RetailerFilterBar` | `components/specials/RetailerFilterBar/` | Horizontal scroll of `Chip` toggles, one per `GET /retailers` result + "All". |

### 7.6 Shopping List Components

| Component | Location | Description |
|---|---|---|
| `ShoppingListSummaryCard` | `components/shopping-lists/ShoppingListSummaryCard/` | `Card` showing list name, item count, created date. Used on [Shopping Lists](#shopping-lists). |
| `ShoppingListItemRow` | `components/shopping-lists/ShoppingListItemRow/` | Checkbox, ingredient name + quantity/unit, optional recipe-source tag, delete icon. Strikethrough style when `isChecked`. Used on [Shopping List Detail](#shopping-list-detail). |

### 7.7 Admin Components

| Component | Location | Description |
|---|---|---|
| `DataTable` | `components/admin/DataTable/` | Generic paginated table: columns config, row actions (edit/delete icons), empty state. Used on every Admin list screen (Ingredients, Recipes, Retailers, Stores, Specials, Users). |
| `AdminFormModal` | `components/admin/AdminFormModal/` | `Modal` wrapper with form footer (Cancel/Save buttons + loading state). Used for Ingredient/Retailer/Store create-edit forms. |
| `RoleBadge` | `components/admin/RoleBadge/` | `Badge` variant for `'user'`/`'admin'` — used on [User Management](#user-management). |
| `BulkSpecialsForm` | `components/admin/BulkSpecialsForm/` | Repeating row form (item name, price, unit, ingredient picker, store picker) + retailer/date-range header. Used on [Specials Upload](#specials-upload). |
| `RecipeIngredientFormRow` | `components/admin/RecipeIngredientFormRow/` | `IngredientAutocomplete` + quantity/unit/optional/notes fields, used in a repeating list. Used on [Recipe Editor](#recipe-editor). |

---

## 8. Customer Screens (Mobile-First)

Each entry: **Route**, **Purpose**, **Layout** (top-to-bottom regions), **Components** (from Section 7), **API Calls** (mapped to `PANTRYPAL_BACKEND_PRD.md` §7), **States** (loading/empty/error beyond the obvious happy path).

### 8.0 Auth & Onboarding (shared — full-width centered forms, no shell)

#### Login

- **Route:** `/login`
- **Purpose:** Authenticate an existing user.
- **Layout:** Logo/wordmark, "Welcome back" heading, email `Input`, password `Input`, "Log in" `Button` (primary, full-width), "Don't have an account? Sign up" link to `/register`.
- **Components:** `Input`, `Button`
- **API Calls:** `POST /auth/login` (Backend PRD §5) → on success, store tokens, then `GET /profile` (§7.1) to determine role/route target.
- **States:** loading (button spinner), error (inline banner — "Invalid email or password").

#### Register

- **Route:** `/register`
- **Purpose:** Create a new account.
- **Layout:** Logo, "Create your account" heading, name/email/password `Input`s, "Sign up" `Button`, "Already have an account? Log in" link.
- **Components:** `Input`, `Button`
- **API Calls:** `POST /auth/register` (§5) → on success, navigate to `/login` with a "check your email" `Toast`, or directly to `/onboarding` if the backend auto-confirms in non-prod environments.
- **States:** loading, error (e.g. "Email already registered").

#### Onboarding

- **Route:** `/onboarding`
- **Purpose:** One-time setup — preferred shopping area + dietary preferences, so Recipe Match and Specials are personalized from first use.
- **Layout:** `ProgressSteps` (2 steps), Step 1: "Where do you usually shop?" — suburb text `Input` (free text maps to `UserProfile.preferredArea`), Step 2: "Any dietary preferences?" — multi-select `Chip` group (Vegetarian, Vegan, Halaal, Pescatarian, No Pork, Dairy-Free — client-side fixed list mapped to `dietaryPreferences` string array). "Skip" link and "Done" `Button`.
- **Components:** `ProgressSteps`, `Input`, `Chip`, `Button`
- **API Calls:** `PUT /profile` (§7.1) with `{ preferredArea, dietaryPreferences }` on "Done" or "Skip" (skip sends empty/unchanged values).
- **States:** loading on submit.

---

### 8.1 Pantry Tab

#### Pantry

- **Route:** `/pantry` (Pantry tab index)
- **Purpose:** Home screen — view and manage everything currently in the user's pantry.
- **Layout:**
  - Top bar: "My Pantry" title, camera icon button (→ Photo Capture) and "+" icon button (→ Add Item sheet).
  - Body: `PantryItemRow` list, grouped by `Ingredient.category` (section headers e.g. "Vegetables", "Spices").
  - Floating action / bottom sheet trigger: "Add Item" → `BottomSheet` with `IngredientAutocomplete` + quantity + unit + "Add" `Button`.
- **Components:** `PantryItemRow`, `BottomSheet`, `IngredientAutocomplete`, `QuantityStepper`, `EmptyState`, `Spinner`
- **API Calls:**
  - `GET /pantry` (§7.3) — initial load.
  - `POST /pantry/items` (§7.3) — manual add (single item, from the sheet).
  - `PUT /pantry/items/{id}` (§7.3) — quantity change via `QuantityStepper`.
  - `DELETE /pantry/items/{id}` (§7.3) — swipe-to-delete or delete icon.
- **States:** loading (skeleton rows), empty (`EmptyState` — "Your pantry is empty. Add items manually or snap a photo." with both CTAs), error (`Toast`).

#### Photo Capture

- **Route:** `/pantry/capture`
- **Purpose:** Capture or upload a photo of the pantry/fridge/receipt for AI ingredient recognition.
- **Layout:** Full-screen `PhotoCaptureFrame` — camera viewport (native file input with `capture="environment"`) or "Choose from gallery" fallback button, "Take Photo" primary `Button`, back/close icon (top-left) → `/pantry`.
- **Components:** `PhotoCaptureFrame`, `Button`, `Spinner`
- **API Calls:**
  - `POST /pantry/photo-upload-url` (§7.3) — get presigned URL once a photo is selected.
  - Direct `PUT` of the image file to the returned `uploadUrl` (S3, not the API).
  - `POST /pantry/photo-analyze` (§7.3) — triggered automatically after upload completes; on success, navigate to `/pantry/capture/review` with the `suggestions` payload.
- **States:** uploading (full-screen `Spinner` with "Uploading photo…"), analyzing (`Spinner` with "Looking at your pantry…" — this call can take a few seconds, set expectations), error (retake/retry option).

#### Photo Review & Confirm

- **Route:** `/pantry/capture/review`
- **Purpose:** The human-in-the-loop step — user reviews/edits AI suggestions before anything is saved (`PRODUCT_OVERVIEW.md` §9).
- **Layout:**
  - `ProgressSteps` (step 2 of 2: "Review").
  - List of `SuggestionReviewRow`, one per AI suggestion — editable name (if unmatched), `QuantityStepper`, unit, low-confidence visual flag (amber outline if `confidence < 0.8`), remove (×) icon per row.
  - "Add item manually" link (appends a blank `SuggestionReviewRow` using `IngredientAutocomplete`).
  - Bottom: "Add N items to pantry" primary `Button` (N = current row count).
- **Components:** `ProgressSteps`, `SuggestionReviewRow`, `IngredientAutocomplete`, `Button`, `EmptyState` (if `suggestions` is empty — "We couldn't identify any items. Try a clearer photo or add manually.")
- **API Calls:** `POST /pantry/items` (§7.3) on confirm — sends the (edited) list, using `ingredientId` for matched rows and `ingredientName` for unmatched/manually-added rows. On success, navigate to `/pantry` with a success `Toast` ("12 items added to your pantry").
- **States:** loading on submit, empty suggestions (see above).

---

### 8.2 Recipes Tab

#### Recipe Match ("Cook Now")

- **Route:** `/recipes` (Recipes tab index/default)
- **Purpose:** PantryPal's core screen — "what can I cook right now?"
- **Layout:**
  - Top bar: "Recipes" title, `Tabs` segmented control: **Cook Now** (active) / **Browse**.
  - Body: `RecipeCard` list, fully-makeable recipes first (green "Makeable" `Badge`), then "almost makeable" (amber "Missing 2" `Badge`), each card tappable → Recipe Detail.
  - Pull-to-refresh.
- **Components:** `Tabs`, `RecipeCard`, `Badge`, `EmptyState`, `Spinner`
- **API Calls:** `GET /recipes/match?maxMissing=2` (§7.4) — initial load and pull-to-refresh (re-evaluates against current pantry).
- **States:** loading (skeleton cards), empty (`EmptyState` — "Add items to your pantry to see recipe matches" → CTA to `/pantry`), error (`Toast`).

#### Recipe Browse

- **Route:** `/recipes/browse`
- **Purpose:** General recipe search/browse, independent of pantry contents.
- **Layout:**
  - Top bar: "Recipes" title, `Tabs` (Cook Now / **Browse**, active).
  - `SearchBar` (search by title) + cuisine `Chip` filter row (including a "South African" chip surfacing `isSaStaple` recipes).
  - `RecipeCard` grid/list (no match badge), infinite scroll / "Load more".
- **Components:** `Tabs`, `SearchBar`, `Chip`, `RecipeCard`, `EmptyState`, `Spinner`
- **API Calls:** `GET /recipes?search=&cuisine=&isSaStaple=&page=&pageSize=` (§7.4).
- **States:** loading, empty ("No recipes found for '...'"), error.

#### Recipe Detail

- **Route:** `/recipes/:id`
- **Purpose:** Full recipe view — ingredients (with pantry status), instructions, and cost-to-complete.
- **Layout:**
  - Hero image, title, cuisine/prep/cook/servings meta row.
  - "Ingredients" section: `RecipeIngredientRow` list, each showing `inPantry` check (green check icon) or "missing" (neutral icon + included in cost panel below).
  - `CostBreakdownPanel` (collapsible, expanded by default if any ingredients are missing) — `cheapestSingleRetailer` summary, `cheapestCombination` summary, per-missing-ingredient `RetailerOfferRow` list, `uncoveredIngredientIds` shown as "No current special".
  - "Instructions" section: numbered steps.
  - Sticky bottom bar: "Add missing to shopping list" primary `Button` (hidden if fully makeable).
- **Components:** `RecipeIngredientRow`, `CostBreakdownPanel`, `RetailerOfferRow`, `Button`, `Spinner`
- **API Calls:**
  - `GET /recipes/{id}` (§7.4) — recipe + ingredients + `inPantry` flags.
  - `GET /recipes/{id}/cost?area={preferredArea}` (§7.4) — cost panel, loaded lazily when the panel is expanded (or eagerly if any ingredient is missing).
  - `POST /shopping-lists/{id}/from-recipe/{recipeId}` (§7.7) — "Add missing to shopping list". If the user has no shopping list yet, first call `POST /shopping-lists` (§7.7) with default name, then this endpoint. If the user has exactly one list, use it directly; if multiple, show a small picker (`BottomSheet` with `ShoppingListSummaryCard` list + "New list" option).
- **States:** loading, error (404 → "Recipe not found").

---

### 8.3 Specials Tab

#### Specials Browse

- **Route:** `/specials`
- **Purpose:** Browse this week's specials across SA retailers.
- **Layout:**
  - Top bar: "Specials" title.
  - `RetailerFilterBar` (Chip row: All / Checkers / Pick n Pay / Woolworths / Shoprite / …).
  - `SearchBar` (search by item name).
  - `SpecialCard` grid/list, sorted by `validTo` ascending (soonest-expiring first) — infinite scroll / "Load more".
- **Components:** `RetailerFilterBar`, `SearchBar`, `SpecialCard`, `EmptyState`, `Spinner`
- **API Calls:**
  - `GET /retailers` (§7.5) — populate filter bar.
  - `GET /specials?retailerId=&search=&active=true&page=&pageSize=` (§7.6).
- **States:** loading, empty ("No specials match your search"), error.

---

### 8.4 Lists Tab

#### Shopping Lists

- **Route:** `/shopping-lists` (Lists tab index)
- **Purpose:** View and manage all shopping lists.
- **Layout:**
  - Top bar: "Shopping Lists" title, "+" icon button → inline "New list" `BottomSheet` (name `Input` + "Create" `Button`).
  - `ShoppingListSummaryCard` list, each tappable → Shopping List Detail. Swipe-to-delete.
- **Components:** `ShoppingListSummaryCard`, `BottomSheet`, `Input`, `Button`, `EmptyState`, `Spinner`
- **API Calls:**
  - `GET /shopping-lists` (§7.7).
  - `POST /shopping-lists` (§7.7) — create.
  - `DELETE /shopping-lists/{id}` (§7.7) — delete.
- **States:** loading, empty (`EmptyState` — "No shopping lists yet" + "Create one" CTA), error.

#### Shopping List Detail

- **Route:** `/shopping-lists/:id`
- **Purpose:** Manage items on a single shopping list — the in-store checklist experience.
- **Layout:**
  - Top bar: list name (editable inline — future enhancement, not v1), back button.
  - `ShoppingListItemRow` list, grouped by `recipeId` (section header = recipe title, or "Other items" for `recipeId: null`), checkbox toggles `isChecked` (strikethrough style).
  - "+" button → `BottomSheet` with `IngredientAutocomplete` + `QuantityStepper` + unit + "Add" `Button`.
- **Components:** `ShoppingListItemRow`, `BottomSheet`, `IngredientAutocomplete`, `QuantityStepper`, `EmptyState`, `Spinner`
- **API Calls:**
  - `GET /shopping-lists/{id}` (§7.7) — initial load.
  - `POST /shopping-lists/{id}/items` (§7.7) — manual add.
  - `PUT /shopping-lists/{id}/items/{itemId}` (§7.7) — toggle `isChecked`, edit quantity.
  - `DELETE /shopping-lists/{id}/items/{itemId}` (§7.7) — remove item.
- **States:** loading, empty (`EmptyState` — "This list is empty. Add items or add a recipe from Recipe Detail."), error (403/404 → redirect to `/shopping-lists`).

---

### 8.5 Profile Tab

#### Profile & Settings

- **Route:** `/profile`
- **Purpose:** View/edit personal preferences and log out.
- **Layout:**
  - User name + email (read-only) header.
  - "Preferred shopping area" `Input`.
  - "Dietary preferences" `Chip` multi-select (same fixed list as Onboarding).
  - "Save changes" `Button`.
  - Divider, "Log out" `Button` (danger/secondary styling).
- **Components:** `Input`, `Chip`, `Button`
- **API Calls:**
  - `GET /profile` (§7.1) — initial load.
  - `PUT /profile` (§7.1) — save changes.
  - Logout: clear Redux `auth` state + `localStorage` token, navigate to `/login` (no dedicated backend logout endpoint in §5).
- **States:** loading, saved confirmation (`Toast`), error.

---

## 9. Admin/Backoffice Screens (Desktop Only)

Reuses the existing `Layout` (`Header` + `Sidebar` + `<Outlet>`). Same per-screen template as Section 8.

#### Admin Dashboard

- **Route:** `/admin`
- **Purpose:** Landing page for admins — quick links and at-a-glance counts.
- **Layout:** Page title "Dashboard", a row of summary `Card`s (Total Ingredients, Total Recipes, Active Specials, Total Users — each a count + link into the relevant section). No dedicated count endpoint exists; each `Card` fetches `total` from its respective list endpoint with `pageSize=1`.
- **Components:** `Card`, `Spinner`
- **API Calls:** `GET /ingredients?pageSize=1`, `GET /recipes?pageSize=1`, `GET /specials?active=true&pageSize=1`, `GET /admin/users?pageSize=1` (§7.2, §7.4, §7.6, §7.8) — read `total` from each `PaginatedResponse`.
- **States:** loading (skeleton cards), error (per-card, non-blocking).

#### Ingredient Catalog

- **Route:** `/admin/ingredients`
- **Purpose:** Manage the canonical ingredient list (name, category, default unit, aliases) that underpins pantry items, recipe ingredients, and specials mapping.
- **Layout:** Page title "Ingredients", "+ New Ingredient" `Button` (top-right) → `AdminFormModal`. `SearchBar` + category `Select` filter. `DataTable` columns: Name, Category, Default Unit, Aliases (comma-joined), Actions (Edit/Delete icons).
- **Components:** `DataTable`, `SearchBar`, `Select`, `AdminFormModal`, `ConfirmDialog`, `Spinner`, `EmptyState`
- **API Calls:**
  - `GET /ingredients?search=&category=&page=&pageSize=` (§7.2) — table data.
  - `POST /admin/ingredients` (§7.2) — create, via `AdminFormModal` (name, category, defaultUnit, aliases).
  - `PUT /admin/ingredients/{id}` (§7.2) — edit, via the same modal pre-filled.
  - `DELETE /admin/ingredients/{id}` (§7.2) — via `ConfirmDialog`; on `409` (referenced by pantry/recipe/special/list rows) show an error `Toast` explaining the ingredient is in use.
- **States:** loading, empty, error, delete-blocked (409 → `Toast`).

#### Recipe Management

- **Route:** `/admin/recipes`
- **Purpose:** Browse, create, edit, and delete recipes (including SA staples).
- **Layout:** Page title "Recipes", "Import from TheMealDB" `Button` → `/admin/recipes/import`, "+ New Recipe" `Button` → `/admin/recipes/new`. `SearchBar` + cuisine `Select` + "SA Staple" `Chip` filter. `DataTable` columns: Title, Cuisine, Servings, SA Staple (badge), Source (admin/api), Actions (Edit/Delete).
- **Components:** `DataTable`, `SearchBar`, `Select`, `Chip`, `Badge`, `ConfirmDialog`, `Spinner`, `EmptyState`
- **API Calls:**
  - `GET /recipes?search=&cuisine=&isSaStaple=&page=&pageSize=` (§7.4) — table data.
  - `DELETE /admin/recipes/{id}` (§7.4) — via `ConfirmDialog` (cascades to `RecipeIngredient`, blocked if referenced by `ShoppingListItem` per backend PRD note).
- **States:** loading, empty, error.

#### Recipe Editor

- **Route:** `/admin/recipes/new` and `/admin/recipes/:id/edit`
- **Purpose:** Create or edit a recipe and its full ingredient list in one form.
- **Layout:** Page title "New Recipe" / "Edit Recipe". Form fields: title, cuisine `Select`, prep/cook time, servings, "SA Staple" toggle (`Chip`), instructions (multi-line `Input`/textarea). "Ingredients" section: repeating `RecipeIngredientFormRow` list with "+ Add Ingredient" link. Sticky bottom bar: "Save Recipe" primary `Button`, "Cancel" link → `/admin/recipes`.
- **Components:** `Input`, `Select`, `Chip`, `RecipeIngredientFormRow`, `IngredientAutocomplete`, `Button`, `Spinner`
- **API Calls:**
  - Edit mode: `GET /recipes/{id}` (§7.4) — prefill form.
  - Create: `POST /admin/recipes` (§7.4) — full recipe + ingredients in one call; on success navigate to `/admin/recipes` with success `Toast`.
  - Edit: `PUT /admin/recipes/{id}` (§7.4) — sends updated fields and/or full replacement ingredient list (per backend PRD §7.4 "replace all" semantics).
- **States:** loading (edit mode prefill), saving, validation error (e.g. missing title), error (404 on edit → redirect to `/admin/recipes`).

#### Recipe Import

- **Route:** `/admin/recipes/import`
- **Purpose:** Import a recipe from TheMealDB by external ID, avoiding manual entry for generic/international recipes.
- **Layout:** Page title "Import Recipe", short explanatory text, "TheMealDB Recipe ID" `Input`, "Import" `Button`. On success, shows a read-only preview of the imported recipe (title, ingredients, instructions) with "View in Recipe Editor" link → `/admin/recipes/:id/edit` (to add SA-specific tweaks or mark as staple) and "Import another" reset.
- **Components:** `Input`, `Button`, `Spinner`, `Card`
- **API Calls:** `POST /admin/recipes/import` (§7.4) with `{ externalId }`. Errors: `400` (missing ID, inline validation), `502` (TheMealDB lookup failed — `Toast` "Recipe not found on TheMealDB").
- **States:** loading, success preview, error.

#### Retailer & Store Management

- **Route:** `/admin/retailers`
- **Purpose:** Manage the list of retailers (Checkers, Pick n Pay, Woolworths, Shoprite, etc.) and their store branches, which underpin specials and cost calculations.
- **Layout:** Page title "Retailers & Stores". Two-level `DataTable`/accordion: top level = retailers (Name, Logo, Actions: Edit/+Add Store), expandable to show that retailer's stores (Branch Name, Address/Area, Actions: Edit/Delete). "+ New Retailer" `Button` (top-right) → `AdminFormModal`.
- **Components:** `DataTable`, `AdminFormModal`, `ConfirmDialog`, `Spinner`, `EmptyState`
- **API Calls:**
  - `GET /retailers` (§7.5) — top-level list.
  - `POST /admin/retailers` (§7.5) — create retailer, via `AdminFormModal` (name, logo URL).
  - `PUT /admin/retailers/{id}` (§7.5) — edit retailer.
  - `GET /stores?retailerId={id}` (§7.5) — load stores when a retailer row is expanded.
  - `POST /admin/stores` (§7.5) — create store branch, via `AdminFormModal` (retailerId, branchName, area).
  - `PUT /admin/stores/{id}` (§7.5) — edit store.
  - `DELETE /admin/stores/{id}` (§7.5) — via `ConfirmDialog`; `409` if referenced by `WeeklySpecial` rows → `Toast`.
- **States:** loading, empty, error, delete-blocked (409 → `Toast`).

#### Weekly Specials Management

- **Route:** `/admin/specials`
- **Purpose:** View, edit, map (to canonical ingredients), and delete all weekly specials.
- **Layout:** Page title "Weekly Specials", "Upload New Specials" `Button` → `/admin/specials/upload`. `RetailerFilterBar` + "Unmapped only" `Chip` toggle. `DataTable` columns: Item Name, Retailer, Store, Price, Valid To, Ingredient (mapped name or "Unmapped" `Badge`, click to map inline via `IngredientAutocomplete`), Actions (Delete).
- **Components:** `DataTable`, `RetailerFilterBar`, `Chip`, `Badge`, `IngredientAutocomplete`, `ConfirmDialog`, `Spinner`, `EmptyState`
- **API Calls:**
  - `GET /specials?retailerId=&unmapped=&page=&pageSize=` (§7.6) — table data.
  - `PUT /admin/specials/{id}` (§7.6) — inline ingredient mapping (`{ ingredientId }`) or other field edits.
  - `DELETE /admin/specials/{id}` (§7.6) — via `ConfirmDialog`.
- **States:** loading, empty, error.

#### Specials Upload

- **Route:** `/admin/specials/upload`
- **Purpose:** Bulk-enter a retailer's new weekly catalogue in one submission — the core backoffice workflow (`PRODUCT_OVERVIEW.md` §8.5).
- **Layout:** Page title "Upload Weekly Specials". `BulkSpecialsForm` — retailer `Select` (required), optional store `Select` (populated from the chosen retailer's stores), then a repeating row group (item name, price, `validFrom`/`validTo` dates, optional `IngredientAutocomplete` to map immediately). "+ Add Row" link, "Upload N Specials" primary `Button`. On success, navigate to `/admin/specials` with a success `Toast` ("24 specials uploaded, 6 unmapped").
- **Components:** `BulkSpecialsForm`, `Select`, `IngredientAutocomplete`, `Button`, `Spinner`
- **API Calls:**
  - `GET /retailers` (§7.5) — retailer `Select` options.
  - `GET /stores?retailerId={id}` (§7.5) — store `Select` options, loaded when a retailer is chosen.
  - `POST /admin/specials` (§7.6) — bulk create; items without `ingredientId` are saved unmapped (per backend PRD §7.6, can be mapped later from Weekly Specials Management).
- **States:** loading (submit), validation error (missing retailer/required row fields), error (`404` if `retailerId`/`storeId`/`ingredientId` invalid → `Toast`).

#### User Management

- **Route:** `/admin/users`
- **Purpose:** View all registered users and promote/demote admin access.
- **Layout:** Page title "Users". `SearchBar` (search by name/email). `DataTable` columns: Name, Email, Role (`RoleBadge`), Preferred Area, Actions (role toggle — "Make Admin" / "Remove Admin" `Button`, guarded by `ConfirmDialog`).
- **Components:** `DataTable`, `SearchBar`, `RoleBadge`, `ConfirmDialog`, `Spinner`, `EmptyState`
- **API Calls:**
  - `GET /admin/users?search=&page=&pageSize=` (§7.8) — table data.
  - `PUT /admin/users/{id}/role` (§7.8) with `{ role: 'admin' | 'user' }` — role toggle. The currently-logged-in admin's own row disables the toggle (prevent self-demotion lockout — client-side guard; not enforced by backend).
- **States:** loading, empty, error.

---

## 10. State Management

Per the "lean Redux" principle (Section 5.2): Redux holds only cross-screen global state. Everything else — list data, form state, pagination, per-screen loading/error — is local `useState`/`useReducer` inside per-domain hooks (Section 10.2), following the `useFetchUsers` pattern in `FRONTEND_CODING_STANDARDS.md`.

### 10.1 Redux Slices

| Slice | Status | Shape | Notes |
|---|---|---|---|
| `auth` | **Modify existing** (`store/slices/auth.slice.ts`) | `{ user: User \| null, token: string \| null, isAuthenticated: boolean, isLoading: boolean, error: string \| null }` | `User` interface must be updated to match `UserProfile` (Backend PRD §6.1): `{ id: string, email: string, name: string, role: 'user' \| 'admin', preferredArea: string \| null, dietaryPreferences: string[] }`. The existing `roles: string[]` field is replaced by singular `role`. Role-based routing (Section 6.4) reads `auth.user.role === 'admin'`. |
| `ui` | **Reuse as-is** (`store/slices/ui.slice.ts`) | `{ isLoading, notification, theme, sidebarOpen }` | `notification` drives the global `Toast`. No PantryPal-specific changes needed. |
| `pantry` | **New** (`store/slices/pantry.slice.ts`) | `{ itemCount: number }` | Powers the `Pantry` tab badge in `BottomNav` (Section 7.1) without every screen needing to know pantry contents. Actions: `setPantryItemCount(count)`. Updated whenever `usePantry`, `usePantryCapture`, or the Photo Review screen mutate pantry items (Section 10.2). |

**Selectors** (`store/selectors/`): `selectUser`, `selectIsAuthenticated`, `selectIsAdmin` (`state.auth.user?.role === 'admin'`), `selectPantryItemCount` — following the existing `auth.selectors.ts` pattern.

### 10.2 Per-Domain Data Hooks

One hook file per screen/concern, in `src/hooks/`, named `use<Domain>.ts`. Each follows the `useFetchUsers` shape — local `data`/`isLoading`/`error` state, calls a service method from Section 11, and dispatches `setNotification` (via `ui` slice) on error per `FRONTEND_CODING_STANDARDS.md` error-handling convention.

| Hook | Used By | Returns |
|---|---|---|
| `useProfile` | [Onboarding](#onboarding), [Profile & Settings](#profile--settings) | `{ profile, isLoading, error, updateProfile }` |
| `usePantry` | [Pantry](#pantry) | `{ items, isLoading, error, addItem, updateItem, removeItem }` — also dispatches `setPantryItemCount` on mutation |
| `usePantryCapture` | [Photo Capture](#photo-capture) | `{ upload, analyze, isUploading, isAnalyzing, error }` |
| `useRecipeMatch` | [Recipe Match ("Cook Now")](#recipe-match-cook-now) | `{ matches, isLoading, error, refetch }` |
| `useRecipes` | [Recipe Browse](#recipe-browse), [Recipe Management](#recipe-management) | `{ recipes, total, isLoading, error, params, setParams }` |
| `useRecipeDetail` | [Recipe Detail](#recipe-detail), [Recipe Editor](#recipe-editor) | `{ recipe, isLoading, error }` |
| `useRecipeCost` | [Recipe Detail](#recipe-detail) | `{ cost, isLoading, error, fetchCost }` (lazy — only called when cost panel expands) |
| `useRecipeAdmin` | [Recipe Editor](#recipe-editor), [Recipe Management](#recipe-management) | `{ createRecipe, updateRecipe, deleteRecipe, importRecipe, isSaving, error }` |
| `useIngredients` | [Pantry](#pantry) (autocomplete), [Ingredient Catalog](#ingredient-catalog), [Recipe Editor](#recipe-editor), [Weekly Specials Management](#weekly-specials-management) | `{ ingredients, total, isLoading, error, params, setParams, createIngredient, updateIngredient, deleteIngredient }` |
| `useRetailers` | [Specials Browse](#specials-browse), [Retailer & Store Management](#retailer--store-management), [Specials Upload](#specials-upload) | `{ retailers, isLoading, error, createRetailer, updateRetailer }` |
| `useStores` | [Retailer & Store Management](#retailer--store-management), [Specials Upload](#specials-upload) | `{ stores, isLoading, error, fetchStoresForRetailer, createStore, updateStore, deleteStore }` |
| `useSpecials` | [Specials Browse](#specials-browse), [Weekly Specials Management](#weekly-specials-management) | `{ specials, total, isLoading, error, params, setParams, updateSpecial, deleteSpecial }` |
| `useSpecialsUpload` | [Specials Upload](#specials-upload) | `{ uploadSpecials, isSaving, error }` |
| `useShoppingLists` | [Shopping Lists](#shopping-lists) | `{ lists, isLoading, error, createList, deleteList }` |
| `useShoppingListDetail` | [Shopping List Detail](#shopping-list-detail), [Recipe Detail](#recipe-detail) (add-from-recipe) | `{ list, isLoading, error, addItem, updateItem, removeItem, addFromRecipe }` |
| `useAdminUsers` | [User Management](#user-management) | `{ users, total, isLoading, error, params, setParams, updateUserRole }` |

`auth` is the exception — it stays in Redux because login/logout state is needed by route guards and the shell shell-selection logic (Section 6.4), both outside any single screen's tree.

---

## 11. API Service Layer

One service file per domain in `src/services/`, each a class singleton following `auth.service.ts` (exported as `new XService()`), using the existing `ApiClient` (`get`/`post`/`put`/`patch`/`delete`). All 42 endpoints from `PANTRYPAL_BACKEND_PRD.md` §7/§9.2 are mapped below. Request/response types live alongside each service in `src/types/<domain>.types.ts`, mirroring the `I*` interfaces defined in the backend PRD's repository sections.

| Service File | Method | HTTP Call (Backend PRD §) | Used By |
|---|---|---|---|
| `auth.service.ts` *(existing)* | `login`, `register` | `POST /auth/login`, `POST /auth/register` (§5) | [Login](#login), [Register](#register) |
| `profile.service.ts` | `getProfile()` | `GET /profile` (§7.1) | `useProfile`, app bootstrap (populate `auth.user`) |
| `profile.service.ts` | `updateProfile(data)` | `PUT /profile` (§7.1) | `useProfile` → [Onboarding](#onboarding), [Profile & Settings](#profile--settings) |
| `ingredients.service.ts` | `listIngredients(params)` | `GET /ingredients` (§7.2) | `useIngredients` → [Pantry](#pantry) autocomplete, [Ingredient Catalog](#ingredient-catalog), [Recipe Editor](#recipe-editor), [Weekly Specials Management](#weekly-specials-management) |
| `ingredients.service.ts` | `createIngredient(data)` | `POST /admin/ingredients` (§7.2) | `useIngredients` → [Ingredient Catalog](#ingredient-catalog) |
| `ingredients.service.ts` | `updateIngredient(id, data)` | `PUT /admin/ingredients/{id}` (§7.2) | `useIngredients` → [Ingredient Catalog](#ingredient-catalog) |
| `ingredients.service.ts` | `deleteIngredient(id)` | `DELETE /admin/ingredients/{id}` (§7.2) | `useIngredients` → [Ingredient Catalog](#ingredient-catalog) |
| `pantry.service.ts` | `listPantryItems()` | `GET /pantry` (§7.3) | `usePantry` → [Pantry](#pantry) |
| `pantry.service.ts` | `addPantryItems(items)` | `POST /pantry/items` (§7.3) | `usePantry` → [Pantry](#pantry); also [Photo Review & Confirm](#photo-review--confirm) (confirm step) |
| `pantry.service.ts` | `updatePantryItem(id, data)` | `PUT /pantry/items/{id}` (§7.3) | `usePantry` → [Pantry](#pantry) (`QuantityStepper`) |
| `pantry.service.ts` | `deletePantryItem(id)` | `DELETE /pantry/items/{id}` (§7.3) | `usePantry` → [Pantry](#pantry) |
| `pantry.service.ts` | `getPhotoUploadUrl()` | `POST /pantry/photo-upload-url` (§7.3) | `usePantryCapture` → [Photo Capture](#photo-capture) |
| `pantry.service.ts` | `analyzePhoto(photoKey)` | `POST /pantry/photo-analyze` (§7.3) | `usePantryCapture` → [Photo Capture](#photo-capture) → [Photo Review & Confirm](#photo-review--confirm) |
| `recipes.service.ts` | `listRecipes(params)` | `GET /recipes` (§7.4) | `useRecipes` → [Recipe Browse](#recipe-browse), [Recipe Management](#recipe-management) |
| `recipes.service.ts` | `matchRecipes(maxMissing)` | `GET /recipes/match` (§7.4) | `useRecipeMatch` → [Recipe Match ("Cook Now")](#recipe-match-cook-now) |
| `recipes.service.ts` | `getRecipe(id)` | `GET /recipes/{id}` (§7.4) | `useRecipeDetail` → [Recipe Detail](#recipe-detail), [Recipe Editor](#recipe-editor) (prefill) |
| `recipes.service.ts` | `getRecipeCost(id, area)` | `GET /recipes/{id}/cost` (§7.4) | `useRecipeCost` → [Recipe Detail](#recipe-detail) (`CostBreakdownPanel`) |
| `recipes.service.ts` | `createRecipe(data)` | `POST /admin/recipes` (§7.4) | `useRecipeAdmin` → [Recipe Editor](#recipe-editor) (create) |
| `recipes.service.ts` | `updateRecipe(id, data)` | `PUT /admin/recipes/{id}` (§7.4) | `useRecipeAdmin` → [Recipe Editor](#recipe-editor) (edit) |
| `recipes.service.ts` | `deleteRecipe(id)` | `DELETE /admin/recipes/{id}` (§7.4) | `useRecipeAdmin` → [Recipe Management](#recipe-management) |
| `recipes.service.ts` | `importRecipe(externalId)` | `POST /admin/recipes/import` (§7.4) | `useRecipeAdmin` → [Recipe Import](#recipe-import) |
| `retailers.service.ts` | `listRetailers()` | `GET /retailers` (§7.5) | `useRetailers` → [Specials Browse](#specials-browse), [Retailer & Store Management](#retailer--store-management), [Specials Upload](#specials-upload) |
| `retailers.service.ts` | `createRetailer(data)` | `POST /admin/retailers` (§7.5) | `useRetailers` → [Retailer & Store Management](#retailer--store-management) |
| `retailers.service.ts` | `updateRetailer(id, data)` | `PUT /admin/retailers/{id}` (§7.5) | `useRetailers` → [Retailer & Store Management](#retailer--store-management) |
| `retailers.service.ts` | `listStores(params)` | `GET /stores` (§7.5) | `useStores` → [Retailer & Store Management](#retailer--store-management), [Specials Upload](#specials-upload) |
| `retailers.service.ts` | `createStore(data)` | `POST /admin/stores` (§7.5) | `useStores` → [Retailer & Store Management](#retailer--store-management) |
| `retailers.service.ts` | `updateStore(id, data)` | `PUT /admin/stores/{id}` (§7.5) | `useStores` → [Retailer & Store Management](#retailer--store-management) |
| `retailers.service.ts` | `deleteStore(id)` | `DELETE /admin/stores/{id}` (§7.5) | `useStores` → [Retailer & Store Management](#retailer--store-management) |
| `specials.service.ts` | `listSpecials(params)` | `GET /specials` (§7.6) | `useSpecials` → [Specials Browse](#specials-browse), [Weekly Specials Management](#weekly-specials-management) |
| `specials.service.ts` | `getSpecialsByIngredient(ingredientId)` | `GET /specials/ingredient/{ingredientId}` (§7.6) | Not called directly by any screen — used internally by `GET /recipes/{id}/cost` on the backend. Included in the service for completeness/future use (e.g. an "alternatives" view). |
| `specials.service.ts` | `createSpecials(data)` | `POST /admin/specials` (§7.6) | `useSpecialsUpload` → [Specials Upload](#specials-upload) |
| `specials.service.ts` | `updateSpecial(id, data)` | `PUT /admin/specials/{id}` (§7.6) | `useSpecials` → [Weekly Specials Management](#weekly-specials-management) (mapping/edit) |
| `specials.service.ts` | `deleteSpecial(id)` | `DELETE /admin/specials/{id}` (§7.6) | `useSpecials` → [Weekly Specials Management](#weekly-specials-management) |
| `shopping-lists.service.ts` | `listShoppingLists()` | `GET /shopping-lists` (§7.7) | `useShoppingLists` → [Shopping Lists](#shopping-lists) |
| `shopping-lists.service.ts` | `createShoppingList(data)` | `POST /shopping-lists` (§7.7) | `useShoppingLists` → [Shopping Lists](#shopping-lists); also [Recipe Detail](#recipe-detail) (auto-create if none exists) |
| `shopping-lists.service.ts` | `getShoppingList(id)` | `GET /shopping-lists/{id}` (§7.7) | `useShoppingListDetail` → [Shopping List Detail](#shopping-list-detail) |
| `shopping-lists.service.ts` | `deleteShoppingList(id)` | `DELETE /shopping-lists/{id}` (§7.7) | `useShoppingLists` → [Shopping Lists](#shopping-lists) |
| `shopping-lists.service.ts` | `addShoppingListItems(listId, items)` | `POST /shopping-lists/{id}/items` (§7.7) | `useShoppingListDetail` → [Shopping List Detail](#shopping-list-detail) |
| `shopping-lists.service.ts` | `updateShoppingListItem(listId, itemId, data)` | `PUT /shopping-lists/{id}/items/{itemId}` (§7.7) | `useShoppingListDetail` → [Shopping List Detail](#shopping-list-detail) (`isChecked`, quantity) |
| `shopping-lists.service.ts` | `deleteShoppingListItem(listId, itemId)` | `DELETE /shopping-lists/{id}/items/{itemId}` (§7.7) | `useShoppingListDetail` → [Shopping List Detail](#shopping-list-detail) |
| `shopping-lists.service.ts` | `addRecipeToShoppingList(listId, recipeId)` | `POST /shopping-lists/{id}/from-recipe/{recipeId}` (§7.7) | `useShoppingListDetail` → [Recipe Detail](#recipe-detail) ("Add missing to shopping list") |
| `admin-users.service.ts` | `listUsers(params)` | `GET /admin/users` (§7.8) | `useAdminUsers` → [User Management](#user-management) |
| `admin-users.service.ts` | `updateUserRole(id, role)` | `PUT /admin/users/{id}/role` (§7.8) | `useAdminUsers` → [User Management](#user-management) |

---

## 12. User Journeys → Screen Flows

Each journey below mirrors `PANTRYPAL_BACKEND_PRD.md` §12 (and `PRODUCT_OVERVIEW.md` §8), expressed as a screen-to-screen flow. Use these to wire up navigation and to verify the Figma frame sequence (Section 14) covers every step.

### 12.1 New User Signup & First Pantry Capture

[Register](#register) → (success) → [Login](#login) → [Onboarding](#onboarding) (`PUT /profile`) → [Pantry](#pantry) (empty state) → tap camera icon → [Photo Capture](#photo-capture) (`POST /pantry/photo-upload-url`, S3 upload, `POST /pantry/photo-analyze`) → [Photo Review & Confirm](#photo-review--confirm) (edit suggestions, `POST /pantry/items`) → back to [Pantry](#pantry) (`GET /pantry`, now populated, success `Toast`).

### 12.2 Returning User Quick Meal

[Recipe Match ("Cook Now")](#recipe-match-cook-now) (`GET /recipes/match?maxMissing=2`) → tap a recipe → [Recipe Detail](#recipe-detail) (`GET /recipes/{id}`).
- **If fully makeable:** journey ends here (no further calls).
- **If ingredients missing:** `CostBreakdownPanel` expands (`GET /recipes/{id}/cost`) → tap "Add missing to shopping list" → (auto-create via `POST /shopping-lists` if none exists, or picker if multiple) → `POST /shopping-lists/{id}/from-recipe/{recipeId}` → confirmation `Toast`, optional navigate to [Shopping List Detail](#shopping-list-detail).

### 12.3 Browsing Recipes & Checking Costs

[Recipe Browse](#recipe-browse) (`GET /recipes?search=&cuisine=`) → tap a recipe → [Recipe Detail](#recipe-detail) (`GET /recipes/{id}`) → expand cost panel (`GET /recipes/{id}/cost`) → tap a `RetailerOfferRow`'s ingredient to drill in (`GET /specials/ingredient/{ingredientId}` — surfaced as an expandable "other offers for this item" row within `RetailerOfferRow`, not a separate screen) → *(optional)* "Add missing to shopping list", same as 12.2.

### 12.4 Browsing Specials Directly

[Specials Browse](#specials-browse) (`GET /retailers` populates `RetailerFilterBar`, then `GET /specials?retailerId=&search=&active=true`) → tap a retailer chip to filter → *(optional, future enhancement)* tap a `SpecialCard` to see store branches via `GET /stores?retailerId=&suburb={preferredArea}` — v1 ships specials browsing only; per-store drill-down is not a separate screen yet.

### 12.5 Admin Weekly Specials Upload

[Login](#login) (admin account) → [Admin Dashboard](#admin-dashboard) → sidebar → [Weekly Specials Management](#weekly-specials-management) → "Upload New Specials" → [Specials Upload](#specials-upload) (`GET /retailers`, `GET /stores?retailerId=`, `GET /ingredients?search=` via `IngredientAutocomplete` per row, then `POST /admin/specials`) → back to [Weekly Specials Management](#weekly-specials-management) (`GET /specials?retailerId=&unmapped=true`) → inline-map any remaining unmapped rows (`PUT /admin/specials/{id}`) → *(corrections)* delete via `DELETE /admin/specials/{id}`.

### 12.6 Admin Add SA Recipe

[Login](#login) (admin account) → [Recipe Management](#recipe-management) → "+ New Recipe" → [Recipe Editor](#recipe-editor) (each `RecipeIngredientFormRow` uses `IngredientAutocomplete` against `GET /ingredients?search=`; toggle "SA Staple" on; submit → `POST /admin/recipes` with `isSaStaple: true`) → back to [Recipe Management](#recipe-management) → tap the new recipe's edit action → [Recipe Editor](#recipe-editor) (`GET /recipes/{id}` to verify) → *(edits)* `PUT /admin/recipes/{id}`.

### 12.7 (Supplementary) Bulk-Seeding Generic Recipes from TheMealDB

[Login](#login) (admin account) → [Recipe Import](#recipe-import) — repeat per TheMealDB ID: enter ID → `POST /admin/recipes/import` → success preview → "Import another" → [Recipe Management](#recipe-management) (`GET /recipes?search=` to spot-check) → [Ingredient Catalog](#ingredient-catalog) (`GET /ingredients?search=` — review/merge any near-duplicate ingredients created by the import via `PUT /admin/ingredients/{id}`).

This is an operational/seeding flow run once per recipe batch, not a recurring admin task — call it out as such in the Figma brief (Section 14) so it isn't mistaken for a primary nav destination.

---

## 13. PWA Considerations

| Item | Action |
|---|---|
| `public/manifest.json` | Rebrand: `name: "PantryPal"`, `short_name: "PantryPal"`, `theme_color`/`background_color` set to the `primary` green (`#16A34A`) / `surface` white (`#FFFFFF`) from Section 5.1. |
| Icons (`favicon.ico`, `logo-192.png`, `logo-512.png`, `logo-maskable.png`) | Replace with PantryPal icon (e.g. a stylized pantry/basket using `primary` green) at the same dimensions/formats as the existing template assets. |
| Service worker (Workbox) | Keep the existing precaching of the app shell. Add a runtime caching strategy (`StaleWhileRevalidate`) for `GET /ingredients`, `GET /retailers`, `GET /recipes` (read-mostly, slow-changing reference data) to improve perceived performance on repeat visits. Do **not** cache `/pantry`, `/recipes/match`, `/shopping-lists`, or any `POST`/`PUT`/`DELETE` — these must always reflect live server state. |
| Offline behavior | No offline-write support in v1 (no background sync / IndexedDB queue). If a mutation fails due to no network, show the existing `Toast` error pattern ("You're offline — check your connection and try again"). The cached reference-data routes above still render read-only content while offline. |
| Install prompt | No custom install prompt needed beyond what the existing template provides — PantryPal is consumed primarily via mobile browser/PWA install banner for the Customer Shell. |

---

## 14. Figma Design Brief

This section is written to be handed directly to Claude (or another design-generation agent) to produce a Figma file from this PRD.

### 14.1 Build Order

1. **Design tokens** (Section 5) — create Figma local variables/styles for all color tokens (5.1), text styles (5.2), spacing/radius/elevation values (5.3), and import the Lucide icon set (5.4).
2. **Component library** (Section 7) — build each component as a Figma component with variants where noted (e.g. `Button` primary/secondary/danger × default/loading/disabled; `Badge` success/warning/info; `SpecialCard`/`RecipeCard` default/pressed). Group into Figma pages: "Layout & Navigation", "Core Primitives", "Pantry", "Recipes", "Specials", "Shopping Lists", "Admin".
3. **Customer screens** (Section 8) — one frame per screen at **375×812** (mobile breakpoint, Section 5.5), assembled from the components in step 2. Include all listed states (loading/empty/error) as separate frames or frame variants, named `<Screen> – Default`, `<Screen> – Loading`, `<Screen> – Empty`, `<Screen> – Error`.
4. **Admin screens** (Section 9) — one frame per screen at **1280×800** (desktop breakpoint), reusing the existing `Layout`/`Sidebar`/`Header` components.
5. **Flow connections** — using the journeys in Section 12, connect frames with Figma prototype links in the documented sequence (e.g. Photo Capture → Photo Review & Confirm → Pantry) so the file is click-through-able end to end.

### 14.2 Frame Naming Convention

`[Shell] / [Screen Name] / [State]` — e.g. `Customer / Pantry / Empty`, `Customer / Photo Review & Confirm / Default`, `Admin / Weekly Specials Management / Default`. This mirrors the heading names in Sections 8/9 so the implementation agent (Section 15) can match Figma frames to screen specs unambiguously.

### 14.3 What NOT to Design

- The journey in [12.7](#127-supplementary-bulk-seeding-generic-recipes-from-themealdb) reuses [Recipe Import](#recipe-import) and existing admin list screens — no new frames needed beyond what 14.1 step 4 already covers.
- `GET /specials/ingredient/{ingredientId}` (Section 11) has no dedicated screen — represent it as an expanded/inline state of `RetailerOfferRow` within the [Recipe Detail](#recipe-detail) frame, not a separate frame.
- Per-store drill-down from Specials Browse (mentioned as optional/future in [12.4](#124-browsing-specials-directly)) — skip for v1.

---

## 15. Agent Implementation Instructions

For the agent building the frontend from this PRD + the Figma file from Section 14. Follow `FRONTEND_CODING_STANDARDS.md` and `COMPONENT_STRUCTURE.md` throughout — every new component/hook/service/util needs tests (`CLAUDE.md`), and `npm run lint -- --max-warnings 0` plus `npm run test -- --run` must pass before considering any step done.

1. **Design tokens** — update `tailwind.config.ts` with the Section 5.1–5.3 values (color palette, spacing/radius). Add `lucide-react` to `package.json` (Section 5.4).
2. **Types** — add `src/types/<domain>.types.ts` for each domain in Section 11 (Ingredient, PantryItem, Recipe, RecipeIngredient, Retailer, Store, WeeklySpecial, ShoppingList, ShoppingListItem, UserProfile), matching the `I*` shapes in `PANTRYPAL_BACKEND_PRD.md` §6/§7.
3. **Redux** — update `auth.slice.ts`'s `User` interface and add `pantry.slice.ts` per Section 10.1. Update `store/index.ts` to register the new reducer.
4. **Services** — implement each `*.service.ts` in Section 11, one file per domain, following `auth.service.ts`'s class-singleton pattern.
5. **Shared components** — build bottom-up: Core UI Primitives (7.2) first, then Layout & Navigation (7.1), then domain components (7.3–7.7), each in its own `components/<category>/<Name>/` folder with `.tsx` + `.css` + `__tests__/` + Storybook story, per `COMPONENT_STRUCTURE.md`.
6. **Hooks** — implement each hook in Section 10.2, in `src/hooks/`, with tests covering loading/success/error.
7. **Routing & shells** — replace `src/App.tsx`'s route tree with the structure in Section 6: `CustomerShell` (with `BottomNav`) and the existing `Layout` (Admin Shell), behind `ProtectedRoute`/`AdminRoute` (6.4), reading `auth.user.role`.
8. **Screens** — build each screen in Sections 8 and 9 as a page component under `components/pages/`, wiring the hooks (step 6) and shared components (step 5). Implement in the order of the journeys in Section 12 (12.1 → 12.6) so each milestone is end-to-end testable: Auth/Onboarding → Pantry → Recipe Match/Detail → Specials → Shopping Lists → Admin screens.
9. **PWA** — apply Section 13 (manifest rebrand, icons, service worker runtime caching rules).
10. **Final pass** — run `npm run lint`, `npm run test -- --run`, `npm run build`, and `npm run type-check`; manually click through each journey in Section 12 in a browser per the "test the golden path" requirement in this agent's own operating instructions.

---

## 16. Post-Implementation Checklist

- [ ] All 42 backend endpoints (Section 11) have a corresponding service method and at least one calling hook/screen.
- [ ] All 22 screens (13 customer + 9 admin, Sections 8–9) are routable per Section 6 and reachable via the journeys in Section 12.
- [ ] `auth.slice.ts`'s `User` type matches `UserProfile` (`role: 'user' | 'admin'`, `preferredArea`, `dietaryPreferences`) — no leftover `roles: string[]`.
- [ ] `pantry` slice's `itemCount` updates correctly on add/remove/photo-confirm and is reflected in `BottomNav`.
- [ ] `ProtectedRoute`/`AdminRoute` correctly redirect unauthenticated users to `/login` and non-admins away from `/admin/*`.
- [ ] `tailwind.config.ts` reflects the PantryPal palette (Section 5.1) — no leftover generic `#3B82F6`/`#8B5CF6`/`#EC4899`.
- [ ] `public/manifest.json` and icons rebranded (Section 13).
- [ ] Service worker caches reference-data GETs only, per Section 13.
- [ ] `npm run lint -- --max-warnings 0`, `npm run test -- --run`, `npm run type-check`, and `npm run build` all pass.
- [ ] Every new component/hook/service has tests per `CLAUDE.md`.
- [ ] Manual click-through of journeys 12.1–12.6 in a browser, on both a 375px viewport (Customer Shell) and a 1280px viewport (Admin Shell).

---