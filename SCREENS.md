# PantryPal — Screen Descriptions for Design

This document describes every visible screen in the PantryPal mobile PWA (React 18, Tailwind CSS). The app helps users track their pantry ingredients and discover recipes they can cook right now. All screens sit inside a shared shell with a sticky header and a floating bottom navigation bar.

---

## Shared Shell

### Header
- Sticky at the top of every screen.
- Shows the screen title (e.g. "My Pantry", "Recipes", "Profile") in bold.
- Background is white/surface colour with a subtle bottom border.

### Bottom Navigation Bar
- Fixed at the bottom of the screen, floats slightly above the edge.
- Three tabs: **Pantry** (box/package icon), **Recipes** (chef hat icon), **Profile** (person icon).
- Active tab is highlighted in the brand primary colour; inactive tabs are grey.
- Each tab has an icon above a text label.

---

## 1. Pantry Screen

**Route:** `/pantry`

### Purpose
The user's ingredient inventory. Shows everything currently in their pantry, grouped by food category.

### Layout — Empty State (no items yet)
- Centred vertically on the page.
- Heading: "Your pantry is empty"
- Subtext: "Snap a photo of your shelf or add items manually."
- Two side-by-side buttons below the text:
  - **Scan Pantry** (primary, camera icon) — navigates to the camera/capture screen
  - **Add Manually** (secondary, plus icon) — opens an "Add Item" bottom sheet

### Layout — Populated State (items exist)
- **Top action bar** (right-aligned, small):
  - "Clear" button with a trash icon in red/danger colour — opens a confirmation sheet
  - Plus icon button — opens the "Add Item" bottom sheet
- **Item list** grouped by category (e.g. "Dairy", "Vegetables", "Grains"):
  - Each category has a small uppercase section header
  - Under each header, a list of ingredient rows

### Pantry Item Row
Each row contains (left to right):
- **Item name** in bold
- **Category label** in small grey text below the name
- **Quantity stepper** — minus button, number, plus button
- **Delete button** — trash icon on the far right

### Floating Action Button (FAB)
- Appears only when the pantry has items.
- Fixed to the bottom-right of the screen, above the bottom nav.
- Green pill button with a camera icon and the label "Scan & Add".
- Navigates to the camera/capture screen.

### Add Item Bottom Sheet
- Slides up from the bottom when triggered.
- Title: "Add Item"
- Contains:
  - **Success confirmation banner** (shown after a successful add): green background, text "✓ [Item name] added"
  - **Ingredient autocomplete search field** — user types to search for ingredients
  - **Selected ingredient row** (shown after selecting): ingredient name on the left, quantity stepper on the right
  - **"Add" button** (primary, full width) — disabled until an ingredient is selected
  - **"Done" button** (secondary, full width) — closes the sheet
- The sheet stays open after adding so the user can keep adding items quickly.

### Clear Pantry Confirmation Bottom Sheet
- Slides up from the bottom when the "Clear" button is tapped.
- Title: "Clear your pantry?"
- Body text: "This will remove all [N] items. You can re-scan or add items again afterwards."
- **"Clear Pantry" button** (danger/red, full width)
- **"Cancel" button** (secondary, full width)

---

## 2. Scan & Add Screen (Photo Capture)

**Route:** `/pantry/capture`

### Purpose
The user takes or uploads a photo of their pantry shelf. The AI analyses it and identifies the ingredients.

### Layout — Idle (no photo taken yet)
- Back arrow button in the top-left to return to the Pantry screen.
- Large centred placeholder area with:
  - Camera icon (large, grey)
  - Heading: "Scan your pantry"
  - Subtext: "Point at your shelf or lay items flat — we'll identify what you have."
  - The entire area is a tappable label that opens the device camera (or file picker on desktop). Tapping it opens the native camera/photo picker.

### Layout — Photo Selected (preview shown)
- The captured/selected photo fills the frame.
- Two buttons below the preview:
  - **"Retake"** (secondary) — clears the photo and returns to idle state
  - **"Use Photo"** (primary) — submits the photo for analysis

### Layout — Loading (photo is being uploaded / analysed)
- The camera area is replaced by a full-screen loading spinner.
- Text below the spinner: "Scanning your pantry…"

### Error State
- A red error message appears at the bottom: "Something went wrong. Please try again."

---

## 3. Review Items Screen (Photo Review)

**Route:** `/pantry/capture/review`

### Purpose
After the AI analyses the photo, the user sees a list of identified ingredients. They can edit names, adjust quantities, remove incorrect items, or add extra items before saving everything to their pantry.

### Layout
- **Progress steps bar** at the top: two steps — "Capture" (done) and "Review" (active).
- **Ingredient suggestion list** — one row per identified item:
  - Each row shows the ingredient name, quantity, and unit
  - Rows with **low confidence** (AI unsure) are visually highlighted — left border accent, amber/warning background — and show a "Not sure — please check" badge
  - Rows are sorted: high confidence items first, low confidence items at the bottom
  - Each row has an edit/remove action
- **Manual add field** below the list — a text input to search for and add extra ingredients the AI may have missed. Label/placeholder: "Add item manually..."
- **Primary action button** (full width, sticks to the bottom):
  - Default text: "Add [N] items to pantry"
  - When low-confidence items exist: "Add [N] items to pantry ([M] to review)"
  - Disabled if the list is empty

### Empty State (AI found nothing)
- Message: "We couldn't identify any items"
- Subtext: "Try a clearer photo or add manually."
- The manual add field is still shown so the user can add items by hand.

---

## 4. Recipes Screen (Cook Now Tab)

**Route:** `/recipes`

### Purpose
Shows all recipes the user can cook based on what's in their pantry. Recipes are sorted with fully makeable ones first. Includes an AI goal-based recommendation feature.

### Layout
- **Tab switcher** at the top: two tabs — **Cook Now** (active) and **Browse**.
- **"Missing up to" filter chips** — always visible, above the recipe list:
  - Label: "Missing up to:"
  - Five pill chips: **0**, **1**, **2**, **5**, **Any**
  - The active/selected chip is filled with the primary colour; others are grey
  - Filters the list to only show recipes missing at most N ingredients
- **"What's your goal tonight?" section** (shown only when there are recipe results):
  - Label above chips
  - Four goal chips: **Cost-effective**, **High protein**, **Light meal**, **Quick cook**
  - Tapping a chip sends the current recipe list to an AI endpoint and returns a recommendation
  - Tapping the same chip again clears the recommendation
- **AI Recommendation Card** (shown after a goal is selected and AI responds):
  - Eyebrow label: "✨ Tonight's pick"
  - Dismiss (×) button in the top-right corner of the card
  - Recipe title in bold
  - Rationale text from the AI explaining why it recommended this recipe
  - "View Recipe →" full-width primary button
- **Loading Skeleton** (shown while AI recommendation is loading):
  - Three animated pulse lines inside a card shape
- **Recipe list** — one card per recipe:
  - Recipe image (if available) at the top of the card
  - Recipe title in bold
  - Cuisine / cook time metadata in small grey text
  - Badge in the bottom-left corner:
    - Green "Makeable" badge — for fully makeable recipes
    - Amber/orange "Missing [N]" badge — for recipes with missing ingredients
- **Nudge text** (shown when fewer than 3 results and a filter is active): "Try 'Any' to see more recipes."

### Empty State (no recipes match)
- Centred layout with:
  - Heading: "No recipes found yet"
  - Subtext: "Snap a photo of your pantry and we'll find recipes you can make right now."
  - Two side-by-side buttons:
    - **"Scan Your Pantry"** (primary, camera icon) — goes to camera screen
    - **"Add Items Manually"** (secondary) — goes to Pantry screen

---

## 5. Profile Screen

**Route:** `/profile`

### Purpose
Displays the user's account info and lets them set dietary preferences. Also provides the log out action.

### Layout
- **User info block** at the top:
  - User's full name in bold
  - Email address in smaller grey text below
- **Dietary preferences section**:
  - Section label: "Dietary preferences" (small uppercase)
  - A row of selectable pill chips — one per dietary option (e.g. Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Kosher, Nut-free, Low-carb)
  - Selected chips are filled with the primary colour; unselected are grey
  - Multiple chips can be selected at once (toggle behaviour)
- **"Save changes" button** (primary, full width)
- **Divider line**
- **"Log out" button** (secondary, full width)

---

## Design Context

- **Platform:** Mobile PWA, primarily used on phones. Screens should be designed for ~390px width (iPhone-class).
- **Brand colour:** Currently a mid-green (`#16A34A`). Open to a richer, deeper variant.
- **Current feel:** Functional but plain — standard Tailwind defaults with no strong visual personality.
- **Desired feel:** Premium, warm, food-adjacent. Think Mealime or a modern recipe app — not a supermarket loyalty app.
- **Font:** Currently system default. Wants Inter or a similarly clean sans-serif.
- **Components to style:** Buttons, chips, cards, input fields, bottom nav, sticky header, bottom sheets (modal drawers).
