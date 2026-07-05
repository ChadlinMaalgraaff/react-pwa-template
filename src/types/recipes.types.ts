/**
 * Recipes Domain Types
 * Mirrors Recipe / RecipeIngredient (Backend PRD §6.5-6.6) and
 * /recipes, /recipes/match, /recipes/{id}/cost, /admin/recipes (§7.4)
 */

import { PaginatedResult } from './common.types'

export type RecipeSource = 'admin' | 'api' | 'wikibooks' | 'usda' | 'generated'

export type MealType = 'breakfast' | 'lunch' | 'supper' | 'dessert' | 'snack'

/** Selectable meal-type filters, in display order. */
export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'supper', 'dessert', 'snack']

/** Human-readable labels for each meal type. */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  supper: 'Supper',
  dessert: 'Dessert',
  snack: 'Snack',
}

/**
 * Attribution fields returned by GET /recipes/{id} (all nullable).
 * Two independent works can require credit: the recipe text and the photo.
 * Display is purely data-driven — branch on field presence, never on `source`.
 */
export interface RecipeAttribution {
  imageAuthor: string | null
  imageLicense: string | null
  imageSourceUrl: string | null
  sourceName: string | null
  sourceUrl: string | null
  sourceLicense: string | null
  source: RecipeSource | null
}

export interface RecipeSummary {
  id: string
  title: string
  imageUrl: string | null
  cuisine: string | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
  isSaStaple: boolean
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
  mealTypes?: string[] | null
  cookingBrief?: CookingBriefResponse
}

export interface RecipeIngredientDetail {
  ingredientId: string
  name: string
  quantity: number
  unit: string
  isOptional: boolean
  notes: string | null
  inPantry: boolean
}

export interface RecipeDetail {
  id: string
  title: string
  description: string | null
  instructions: string[]
  imageUrl: string | null
  cuisine: string | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
  isSaStaple: boolean
  ingredients: RecipeIngredientDetail[]
  imageAuthor: string | null
  imageLicense: string | null
  imageSourceUrl: string | null
  sourceName: string | null
  sourceUrl: string | null
  sourceLicense: string | null
  source: RecipeSource | null
  calories?: number | null
  protein?: number | null
  fat?: number | null
  carbs?: number | null
  mealTypes?: string[] | null
  cookingBrief?: CookingBriefResponse
}

export interface ListRecipesParams {
  search?: string
  cuisine?: string
  mealType?: MealType
  isSaStaple?: boolean
  page?: number
  pageSize?: number
}

export type RecipesPage = PaginatedResult<RecipeSummary>

export interface MatchRecipesParams {
  maxMissing?: number
  page?: number
  pageSize?: number
}

export interface MissingIngredient {
  ingredientId: string
  name: string
}

export interface MatchedRecipe {
  id: string
  title: string
  imageUrl: string | null
  totalIngredients: number
  matchedIngredients: number
  missingIngredients: MissingIngredient[]
  isFullyMakeable: boolean
  // AI-estimated nutrition per serving — omitted for recipes not yet enriched, so guard on render.
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  mealTypes?: MealType[]
  cookingBrief?: CookingBriefResponse
}

export type RecipeMatchPage = PaginatedResult<MatchedRecipe>

export interface RecipeCostOffer {
  retailerId: string
  retailerName: string
  itemName: string
  price: number
  validTo: string
}

export interface RecipeCostMissingIngredient {
  ingredientId: string
  name: string
  quantity: number
  unit: string
  cheapestOffers: RecipeCostOffer[]
}

export interface CheapestSingleRetailer {
  retailerId: string
  retailerName: string
  total: number
  coversIngredientIds: string[]
}

export interface CheapestCombination {
  total: number
  byIngredient: Record<string, { retailerId: string; price: number }>
}

export interface RecipeCostResponse {
  recipeId: string
  missingIngredients: RecipeCostMissingIngredient[]
  cheapestSingleRetailer: CheapestSingleRetailer | null
  cheapestCombination: CheapestCombination
  uncoveredIngredientIds: string[]
}

export interface RecipeIngredientInput {
  ingredientId?: string
  ingredientName?: string
  quantity: number
  unit: string
  isOptional?: boolean
  notes?: string
}

export interface CreateRecipeRequest {
  title: string
  description?: string
  instructions: string[]
  imageUrl?: string
  cuisine?: string
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  servings?: number
  isSaStaple?: boolean
  ingredients: RecipeIngredientInput[]
}

export type UpdateRecipeRequest = Partial<CreateRecipeRequest>

export interface ImportRecipeRequest {
  externalId: string
}

export type RecommendGoal = 'cost-effective' | 'high-protein' | 'light-meal' | 'quick-cook'

export interface AiRecommendRequest {
  goal: RecommendGoal
  recipes: MatchedRecipe[]
}

export interface AiRecommendResponse {
  recommendedRecipeId: string
  rationale: string
  goal: string
}

export interface TheMealDBRecipe {
  externalId: string
  title: string
  thumbnail: string | null
  alreadyImported: boolean
}

export interface TheMealDBCategoriesResponse {
  categories: string[]
}

export interface BrowseTheMealDBParams {
  category?: string
  search?: string
}

export interface BrowseTheMealDBResponse {
  recipes: TheMealDBRecipe[]
}

export interface BulkImportFailure {
  externalId: string
  reason: string
}

export interface BulkImportResult {
  imported: number
  skipped: number
  failed: BulkImportFailure[]
}

export interface RecipeMealData {
  id: string
  title: string
  cuisine: string | null
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  servings: number | null
  calories: number | null
  protein: number | null
  fat: number | null
  carbs: number | null
  mealTypes: string[] | null
  isSaStaple: boolean
}

export interface MealDataResponse {
  total: number
  recipes: RecipeMealData[]
}

export interface CookingBriefSegment {
  type: 'intro' | 'step'
  index: number
  stepIndex?: number
  text: string
}

export interface CookingBriefResponse {
  segments: CookingBriefSegment[]
}
