# PantryPal — Customer User Journey Map

## App Summary

**PantryPal** is a PWA that helps users manage their pantry, discover recipes based on what they have, compare ingredient prices across retailers, and build shopping lists. It uses AI photo recognition for pantry scanning and geolocation-aware pricing.

**Tech:** React 18 + TypeScript, Redux Toolkit, React Router v6, Tailwind CSS, Vite, Vitest

---

## Navigation Shell

Bottom nav with 5 tabs (always visible except during camera flows):
`Pantry → Recipes → Specials → Shopping Lists → Profile`

---

## Journey 1: First-Time User Onboarding

**Entry:** App visit, no session

1. `/register` — Sign up with name, email, password. Triggers email verification prompt. Redirects to `/login`.
2. `/login` — Sign in. Role check: `user` → `/pantry`, `admin` → `/admin`.
3. `/onboarding` (Step 1) — Select preferred shopping area/suburb (used for cost calculations).
4. `/onboarding` (Step 2) — Select dietary preferences (Vegan, Vegetarian, Gluten-free, etc.). Both steps are skippable and editable later in Profile.
5. Lands on `/pantry` — empty pantry state with CTAs to add items or scan.

**Key data captured:** `preferredArea`, `dietaryPreferences`

---

## Journey 2: Returning User Login

1. `/login` — Email + password.
2. Redirects to `/pantry`.
3. No onboarding shown (already completed).

---

## Journey 3: Building the Pantry (Manual)

**Entry:** `/pantry` → "Add Item"

1. Bottom sheet opens with ingredient autocomplete field.
2. User searches/selects ingredient.
3. Sets quantity + unit (unit defaults based on ingredient type).
4. Saves. Item appears in pantry grouped by category. `source = "manual"`.
5. User can adjust quantity inline or swipe to delete.

**Data model:** `PantryItem { id, ingredientId, ingredientName, category, quantity, unit, source, addedAt }`

---

## Journey 4: Building the Pantry (AI Photo Scan)

**Entry:** `/pantry` → Camera button

1. `/pantry/capture` — Camera view. User points at pantry shelf and taps capture.
2. Photo uploads via presigned URL to cloud storage.
3. Backend AI analyzes image → returns ingredient suggestions with confidence scores and default quantities.
4. `/pantry/capture/review` — User reviews AI suggestions:
   - Edit quantity/unit per item
   - Remove incorrect suggestions
   - Manually add missed items
5. Confirm → all items bulk-added to pantry (`source = "photo"`).

**Note:** This is a full-screen immersive flow — bottom nav is hidden.

---

## Journey 5: Recipe Discovery (AI Match)

**Entry:** Recipes tab → "Cook Now" sub-tab → `/recipes`

1. `RecipeMatch` component loads recipes matched against current pantry contents.
2. Default filter: `maxMissing ≤ 2` (recipes needing at most 2 more ingredients).
3. Sort: fully makeable recipes first, then by fewest missing.
4. Each card shows: recipe title, image, cuisine, fully-makeable badge or "missing X ingredients".
5. Empty state: "Add items to your pantry to see recipe matches."
6. Tap recipe → Recipe Detail (Journey 7).

---

## Journey 6: Recipe Discovery (Browse)

**Entry:** Recipes tab → "Browse" sub-tab → `/recipes/browse`

1. Search bar for recipe name.
2. Cuisine filter chips: South African, Italian, Indian, Chinese, Mexican, Mediterranean.
3. Dedicated SA Staple filter.
4. Results load 10 per page with "Load more".
5. Each `RecipeCard` shows: title, image, cuisine, prep time, cook time, servings.
6. Tap recipe → Recipe Detail (Journey 7).

---

## Journey 7: Recipe Detail & Shopping List Add

**Entry:** Any recipe card → `/recipes/:id`

1. Hero image, title, cuisine, prep/cook time, servings.
2. Ingredient list: each ingredient shows name, quantity, unit, and **whether user has it in pantry** (in-pantry badge).
3. Instructions as numbered steps.
4. **Cost breakdown panel** (for missing ingredients):
   - Fetches live prices for missing ingredients from retailers in user's preferred area.
   - Shows cheapest single-retailer option.
   - Shows cheapest multi-retailer combination.
5. **"Add missing ingredients to shopping list" CTA:**
   - 0 lists → creates a new list automatically.
   - 1 list → adds directly.
   - 2+ lists → picker modal to select list.
   - Skips ingredients already in pantry.

---

## Journey 8: Shopping List Management

**Entry:** Shopping Lists tab → `/shopping-lists`

1. Hub view: list of shopping lists (name + item count).
2. "+" → create new list (optional name like "Weekly Groceries").
3. Tap list → `/shopping-lists/:id`.
4. Items grouped by recipe source (or "Standalone" for manually added items).
5. Per item: checkbox to mark purchased, quantity/unit inline edit, delete button.
6. "Add Item" button → manual ingredient entry with autocomplete.
7. Delete entire list from hub view.

**Data model:** `ShoppingListItem { id, ingredientId, ingredientName, recipeId, recipeTitle, quantity, unit, isChecked }`

---

## Journey 9: Browsing Weekly Specials

**Entry:** Specials tab → `/specials`

1. Retailer filter bar (Checkers, Woolworths, etc. — or show all).
2. Search bar for specific items.
3. Cards show: item name, price, unit, retailer name + logo, item image, valid-to date.
4. Sorted by expiry date. Paginated (10 per page, "Load more").
5. Empty state: "No specials match your search."

**Use case:** Browse deals before finalising shopping list; find cheap ingredients for a recipe.

**Data model:** `WeeklySpecial { id, retailerId, retailerName, storeId, ingredientId, ingredientName, itemName, price, unit, imageUrl, validFrom, validTo }`

---

## Journey 10: Profile & Settings

**Entry:** Profile tab → `/profile`

1. View account info: name, email.
2. Edit preferred shopping area (suburb) — affects cost calculations across app.
3. Toggle dietary preferences.
4. "Save changes."
5. "Log out."

---

## Key Domain Models

```typescript
UserProfile        { id, email, name, role, preferredArea, dietaryPreferences }
PantryItem         { id, ingredientId, ingredientName, category, quantity, unit, source, addedAt }
MatchedRecipe      { id, title, imageUrl, totalIngredients, matchedIngredients, missingIngredients[], isFullyMakeable }
RecipeDetail       { id, title, description, instructions[], imageUrl, cuisine, prepTimeMinutes, cookTimeMinutes, servings, isSaStaple, ingredients[{ ...inPantry }] }
RecipeCostResponse { recipeId, missingIngredients[cheapestOffers], cheapestSingleRetailer, cheapestCombination }
ShoppingListItem   { id, ingredientId, ingredientName, recipeId, recipeTitle, quantity, unit, isChecked }
WeeklySpecial      { id, retailerId, retailerName, storeId, ingredientId, ingredientName, itemName, price, unit, imageUrl, validFrom, validTo }
```

---

## Feature Flags & Constraints to Note for Review

- **Dietary preferences** are captured on onboarding but it's worth verifying they actually filter recipe results.
- **`maxMissing` threshold** on recipe match is hardcoded to 2 — no user-facing control.
- **Cost calculation** depends on `preferredArea` being set; behaviour if unset should be reviewed.
- **Shopping list creation on recipe detail** has conditional logic (0/1/2+ lists) — edge cases worth testing.
- **Photo capture flow** is the highest-complexity path — AI confidence scores are shown but it's unclear if low-confidence items are flagged differently in the review screen.
- **Offline support** (Service Worker) — which pages/data are cached vs. require connectivity should be verified.
