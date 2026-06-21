# Pantry → Recipe UX Improvements Spec

## Context

This spec covers improvements to the pantry-building and recipe-discovery journeys in PantryPal. The goal is to reduce friction, surface the AI photo capture feature prominently, and give users a fast path to reset their pantry.

All changes are customer-facing only. Admin flows are out of scope.

---

## Problem 1: Camera is buried — no prominent CTA

**Current behaviour:** Camera is a small icon in the top-right header of `/pantry`. The empty state action button is "Add Item" (manual). The camera is mentioned in body text only.

**Fix:**
- On the **empty pantry state**, show two equal-weight CTAs side by side:
  - Primary: "Scan Pantry" (camera icon) → navigates to `/pantry/capture`
  - Secondary: "Add Manually" (plus icon) → opens the add-item bottom sheet
- On the **populated pantry state**, add a floating action button (FAB) at the bottom of the screen with a camera icon and label "Scan & Add". This sits above the bottom nav and is always visible while scrolling.
- Remove the camera icon from the header entirely — the FAB replaces it.

**Files likely affected:**
- `src/components/pages/Pantry/Pantry.tsx`
- `src/components/pages/Pantry/` (empty state rendering)

---

## Problem 2: Manual entry is one-item-at-a-time

**Current behaviour:** The "Add Item" bottom sheet closes after each item is added. Adding 10 items requires opening the sheet 10 times.

**Fix:**
- After a successful add, keep the bottom sheet open and reset the form (clear ingredient selection, reset quantity to default).
- Show an inline confirmation ("Milk added") as a small toast or inline label within the sheet instead of closing it.
- Add a "Done" button to explicitly close the sheet when the user is finished.

**Files likely affected:**
- `src/components/pages/Pantry/Pantry.tsx` (bottom sheet state management)

---

## Problem 3: No way to reset or clear the pantry

**Current behaviour:** Items can only be deleted one at a time via the trash icon. There is no bulk-delete or reset flow.

**Fix:**
- Add a "Clear Pantry" option accessible from a menu (kebab/ellipsis icon) in the pantry page header.
- On tap, show a confirmation bottom sheet:
  - Title: "Clear your pantry?"
  - Body: "This will remove all {count} items. You can re-scan or add items again afterwards."
  - Actions: "Clear Pantry" (danger/destructive) and "Cancel"
- On confirm, call a bulk-delete endpoint (or loop `removeItem` calls) and return to the empty pantry state.
- The header should show this menu icon only when the pantry has items (hide on empty state).

**Files likely affected:**
- `src/components/pages/Pantry/Pantry.tsx`
- `src/hooks/usePantry.ts` — add `clearAll()` method that calls `pantryService.clearPantry()` or batches `removeItem` calls

---

## Problem 4: Photo capture feels slow — two sequential waits

**Current behaviour:** Upload and analysis are two separate async operations shown as sequential status messages ("Uploading photo…" then "Looking at your pantry…"). No progress feedback beyond text.

**Fix:**
- Show a single animated loading state that covers both operations — no need to distinguish upload vs. analysis to the user.
- Use a pulsing animation or skeleton screen with copy: "Scanning your pantry…"
- If technically feasible, pipeline the calls: begin the analysis request as soon as the upload key is returned, without waiting for a separate user interaction.
- Add a subtle progress bar or indeterminate spinner with the pantry/food theme (e.g. a scanning line animation over a pantry shelf illustration).

**Files likely affected:**
- `src/components/pages/PhotoCapture/PhotoCapture.tsx`
- `src/hooks/usePantryCapture.ts` — ensure upload and analyze are chained immediately

---

## Problem 5: Capture screen gives no guidance

**Current behaviour:** The capture screen shows a generic camera icon and the text "Take or upload a photo". No instructions on how to get a good scan.

**Fix:**
- Replace the placeholder with a framed viewfinder UI with a brief tip below:
  - "Point your camera at your pantry shelf or lay items flat on a surface."
- Add a one-line secondary tip: "The more items in frame, the better."
- On first use only (persisted in localStorage), show a brief 2-second onboarding tooltip: "Snap your shelf — we'll identify what you have."

**Files likely affected:**
- `src/components/pages/PhotoCapture/PhotoCaptureFrame.tsx` (or equivalent)
- `src/components/pages/PhotoCapture/PhotoCapture.tsx`

---

## Problem 6: Low-confidence AI suggestions aren't prioritised

**Current behaviour:** Low-confidence suggestions (`confidence < 0.5`) get a badge but appear in the same list position as high-confidence ones. Users tap "Add X items" without noticing the uncertain ones.

**Fix:**
- Sort the suggestions list: high-confidence items first, low-confidence items at the bottom.
- Give low-confidence items a visually distinct row style (e.g. amber left border, slightly muted background).
- Change the badge copy from a generic label to: "Not sure — please check"
- Pre-select all items for addition but make low-confidence items easier to deselect (larger tap target on the delete/remove button).
- Update the submit button copy to reflect uncertainty if low-confidence items are present: "Add {count} items ({lowCount} to review)"

**Files likely affected:**
- `src/components/pages/PhotoReview/PhotoReview.tsx`
- `src/components/pages/PhotoReview/SuggestionReviewRow.tsx` (or equivalent)

---

## Problem 7: Recipe empty state doesn't deep-link to camera

**Current behaviour:** Empty recipe match state shows "Go to Pantry" → sends user to `/pantry` where they still have to find the camera themselves.

**Fix:**
- Change the empty state on `/recipes` to show two CTAs:
  - Primary: "Scan Your Pantry" → navigates directly to `/pantry/capture`
  - Secondary: "Add Items Manually" → navigates to `/pantry` (existing behaviour)
- Update the empty state copy to: "Snap a photo of your pantry and we'll find recipes you can make right now."

**Files likely affected:**
- `src/components/pages/RecipeMatch/RecipeMatch.tsx`

---

## Problem 8: `maxMissing` is hardcoded and silent

**Current behaviour:** Recipe matching uses `maxMissing: 2` with no UI control. Users with sparse pantries see few or no results without knowing why.

**Fix:**
- Add a filter control above the recipe list on `/recipes` (Cook Now tab):
  - Label: "Show recipes missing up to:"
  - Segmented control or chip group: `0` | `1` | `2` | `5` | `Any`
  - Default: `2`
- When the list is short (fewer than 3 results), show an inline nudge: "Try allowing more missing ingredients to see more recipes" with a tap to increment the filter.
- Persist the user's preferred `maxMissing` value in localStorage.

**Files likely affected:**
- `src/components/pages/RecipeMatch/RecipeMatch.tsx`
- `src/hooks/useRecipeMatch.ts` — expose `maxMissing` as a configurable param (it likely already accepts params)

---

## Problem 9: No post-cook loop

**Current behaviour:** After viewing a recipe, there is no way to mark it as cooked or remove used ingredients from the pantry.

**Fix:**
- On the Recipe Detail page, add a "I made this" button (secondary style, below the ingredient list).
- On tap, show a confirmation sheet:
  - Title: "Mark as cooked?"
  - Body: "Remove the ingredients you used from your pantry?"
  - Toggle list of ingredients in the recipe that are currently in the pantry (pre-selected).
  - Actions: "Remove selected" and "Just dismiss"
- On confirm, batch-remove selected pantry items.

**Files likely affected:**
- `src/components/pages/RecipeDetail/RecipeDetail.tsx` (or equivalent)
- `src/hooks/usePantry.ts` — can reuse existing `removeItem` per ingredient

---

## Implementation Priority

| Priority | Problem | Effort |
|---|---|---|
| P0 | Problem 3 — Clear pantry (reset) | Low |
| P0 | Problem 7 — Recipe empty state deep-links to camera | Low |
| P1 | Problem 1 — Prominent camera CTA + FAB | Medium |
| P1 | Problem 2 — Keep bottom sheet open after add | Low |
| P1 | Problem 6 — Low-confidence suggestion sorting + styling | Medium |
| P2 | Problem 8 — `maxMissing` user control | Medium |
| P2 | Problem 4 — Unified loading state for capture | Low |
| P2 | Problem 5 — Capture screen guidance copy | Low |
| P3 | Problem 9 — Post-cook ingredient removal | High |
