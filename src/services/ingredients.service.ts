import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  Ingredient,
  ListIngredientsParams,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  NormalizeBulkResult,
} from '@/types/ingredients.types'

/**
 * Ingredients Service
 * /ingredients, /admin/ingredients (Backend PRD §7.2)
 */
class IngredientsService {
  async listIngredients(params: ListIngredientsParams = {}): Promise<Ingredient[]> {
    const response = await apiClient.get<Ingredient[]>('/ingredients', { params })
    return response.data
  }

  async createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
    const response = await apiClient.post<Ingredient>('/admin/ingredients', data)
    return response.data
  }

  async updateIngredient(id: string, data: UpdateIngredientRequest): Promise<Ingredient> {
    const response = await apiClient.put<Ingredient>(`/admin/ingredients/${id}`, data)
    return response.data
  }

  async deleteIngredient(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/admin/ingredients/${id}`)
    return response.data
  }

  async normalizeIngredientsBulk(): Promise<NormalizeBulkResult> {
    const response = await apiClient.post<NormalizeBulkResult>('/admin/ingredients/normalize-bulk', {}, { timeout: 130000 })
    return response.data
  }
}

export default new IngredientsService()
