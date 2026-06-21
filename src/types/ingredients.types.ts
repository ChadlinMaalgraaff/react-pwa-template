/**
 * Ingredients Domain Types
 * Mirrors Ingredient (Backend PRD §6.3) and /ingredients, /admin/ingredients (§7.2)
 */

export interface Ingredient {
  id: string
  name: string
  category: string | null
  defaultUnit: string
  aliases: string[]
}

export interface ListIngredientsParams {
  search?: string
  category?: string
}

export interface CreateIngredientRequest {
  name: string
  category?: string
  defaultUnit: string
  aliases?: string[]
}

export type UpdateIngredientRequest = Partial<CreateIngredientRequest>

export interface NormalizeBulkResult {
  total: number
  updated: number
  failed: number
}
