/**
 * Recipe Sorting Utilities
 * Shared nutrition-based comparators and a seeded shuffle, used by both the
 * "Cook now" matcher and the "Browse" catalogue so the two tabs sort identically.
 */

/** The AI-estimated nutrition fields both RecipeSummary and MatchedRecipe carry (all optional). */
export interface NutritionFields {
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
}

export type NutritionSort = 'protein' | 'light' | 'low-carb' | 'low-fat' | 'filling'

// Recipes missing the estimate sink to the bottom (Infinity ascending, -Infinity descending)
// so un-enriched recipes never crowd out the relevant results.
const ascBy =
  (key: keyof NutritionFields) =>
  (a: NutritionFields, b: NutritionFields): number =>
    (a[key] ?? Infinity) - (b[key] ?? Infinity)

const descBy =
  (key: keyof NutritionFields) =>
  (a: NutritionFields, b: NutritionFields): number =>
    (b[key] ?? -Infinity) - (a[key] ?? -Infinity)

export const NUTRITION_COMPARATORS: Record<NutritionSort, (a: NutritionFields, b: NutritionFields) => number> = {
  protein: descBy('protein'),
  light: ascBy('calories'),
  'low-carb': ascBy('carbs'),
  'low-fat': ascBy('fat'),
  filling: descBy('calories'),
}

export const NUTRITION_SORT_LABELS: Record<NutritionSort, string> = {
  protein: 'Highest protein',
  light: 'Lightest',
  'low-carb': 'Lowest carb',
  'low-fat': 'Lowest fat',
  filling: 'Most filling',
}

// Small deterministic PRNG so the same seed always yields the same shuffle.
const mulberry32 = (seed: number): (() => number) => {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates shuffle driven by a seed, so the same seed reproduces the same order. */
export const seededShuffle = <T>(items: T[], seed: number): T[] => {
  const random = mulberry32(seed)
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// A seed persisted for the browser session so a random order stays stable when the user
// navigates to a recipe and back, instead of reshuffling on every remount.
export const getSessionShuffleSeed = (storageKey: string): number => {
  const stored = sessionStorage.getItem(storageKey)
  if (stored !== null) {
    const parsed = Number(stored)
    if (Number.isFinite(parsed)) return parsed
  }
  const seed = Math.floor(Math.random() * 2 ** 32)
  sessionStorage.setItem(storageKey, String(seed))
  return seed
}
