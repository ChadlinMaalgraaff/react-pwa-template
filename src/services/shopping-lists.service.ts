import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  ShoppingListSummary,
  ShoppingListDetail,
  ShoppingListItem,
  CreateShoppingListRequest,
  AddShoppingListItemsRequest,
  UpdateShoppingListItemRequest,
  AddRecipeToShoppingListResponse,
} from '@/types/shopping-lists.types'

/**
 * Shopping Lists Service
 * /shopping-lists (Backend PRD §7.7)
 */
class ShoppingListsService {
  async listShoppingLists(): Promise<ShoppingListSummary[]> {
    const response = await apiClient.get<ShoppingListSummary[]>('/shopping-lists')
    return response.data
  }

  async createShoppingList(data: CreateShoppingListRequest = {}): Promise<ShoppingListDetail> {
    const response = await apiClient.post<ShoppingListDetail>('/shopping-lists', data)
    return response.data
  }

  async getShoppingList(id: string): Promise<ShoppingListDetail> {
    const response = await apiClient.get<ShoppingListDetail>(`/shopping-lists/${id}`)
    return response.data
  }

  async deleteShoppingList(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/shopping-lists/${id}`)
    return response.data
  }

  async addShoppingListItems(listId: string, data: AddShoppingListItemsRequest): Promise<ShoppingListItem[]> {
    const response = await apiClient.post<ShoppingListItem[]>(`/shopping-lists/${listId}/items`, data)
    return response.data
  }

  async updateShoppingListItem(
    listId: string,
    itemId: string,
    data: UpdateShoppingListItemRequest
  ): Promise<ShoppingListItem> {
    const response = await apiClient.put<ShoppingListItem>(`/shopping-lists/${listId}/items/${itemId}`, data)
    return response.data
  }

  async deleteShoppingListItem(listId: string, itemId: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/shopping-lists/${listId}/items/${itemId}`)
    return response.data
  }

  async addRecipeToShoppingList(listId: string, recipeId: string): Promise<AddRecipeToShoppingListResponse> {
    const response = await apiClient.post<AddRecipeToShoppingListResponse>(
      `/shopping-lists/${listId}/from-recipe/${recipeId}`,
      {}
    )
    return response.data
  }
}

export default new ShoppingListsService()
