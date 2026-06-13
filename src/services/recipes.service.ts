import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  RecipesPage,
  RecipeDetail,
  RecipeMatchPage,
  RecipeCostResponse,
  ListRecipesParams,
  MatchRecipesParams,
  CreateRecipeRequest,
  UpdateRecipeRequest,
} from '@/types/recipes.types'

/**
 * Recipes Service
 * /recipes, /recipes/match, /recipes/{id}, /recipes/{id}/cost, /admin/recipes (Backend PRD §7.4)
 */
class RecipesService {
  async listRecipes(params: ListRecipesParams = {}): Promise<RecipesPage> {
    const response = await apiClient.get<RecipesPage>('/recipes', { params })
    return response.data
  }

  async matchRecipes(params: MatchRecipesParams = {}): Promise<RecipeMatchPage> {
    const response = await apiClient.get<RecipeMatchPage>('/recipes/match', { params })
    return response.data
  }

  async getRecipe(id: string): Promise<RecipeDetail> {
    const response = await apiClient.get<RecipeDetail>(`/recipes/${id}`)
    return response.data
  }

  async getRecipeCost(id: string, area?: string): Promise<RecipeCostResponse> {
    const response = await apiClient.get<RecipeCostResponse>(`/recipes/${id}/cost`, {
      params: area ? { area } : {},
    })
    return response.data
  }

  async createRecipe(data: CreateRecipeRequest): Promise<RecipeDetail> {
    const response = await apiClient.post<RecipeDetail>('/admin/recipes', data)
    return response.data
  }

  async updateRecipe(id: string, data: UpdateRecipeRequest): Promise<RecipeDetail> {
    const response = await apiClient.put<RecipeDetail>(`/admin/recipes/${id}`, data)
    return response.data
  }

  async deleteRecipe(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/admin/recipes/${id}`)
    return response.data
  }

  async importRecipe(externalId: string): Promise<RecipeDetail> {
    const response = await apiClient.post<RecipeDetail>('/admin/recipes/import', { externalId })
    return response.data
  }
}

export default new RecipesService()
