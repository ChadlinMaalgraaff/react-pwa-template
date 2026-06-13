/**
 * Shopping Lists Domain Types
 * Mirrors ShoppingList / ShoppingListItem (Backend PRD §6.10-6.11) and
 * /shopping-lists (§7.7)
 */

export interface ShoppingListSummary {
  id: string
  name: string
  itemCount: number
  createdAt: string
}

export interface ShoppingListItem {
  id: string
  ingredientId: string
  ingredientName: string
  recipeId: string | null
  recipeTitle: string | null
  quantity: number
  unit: string
  isChecked: boolean
}

export interface ShoppingListDetail {
  id: string
  name: string
  items: ShoppingListItem[]
  createdAt: string
}

export interface CreateShoppingListRequest {
  name?: string
}

export interface AddShoppingListItemInput {
  ingredientId?: string
  ingredientName?: string
  quantity: number
  unit: string
}

export interface AddShoppingListItemsRequest {
  items: AddShoppingListItemInput[]
}

export interface UpdateShoppingListItemRequest {
  quantity?: number
  unit?: string
  isChecked?: boolean
}

export interface AddRecipeToShoppingListResponse {
  addedItems: ShoppingListItem[]
  skippedAlreadyInPantry: string[]
}
