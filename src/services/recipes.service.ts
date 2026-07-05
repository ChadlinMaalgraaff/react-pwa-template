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
  AiRecommendRequest,
  AiRecommendResponse,
  TheMealDBCategoriesResponse,
  BrowseTheMealDBParams,
  BrowseTheMealDBResponse,
  BulkImportResult,
  MealDataResponse,
  CookingBriefResponse,
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

  async getAiRecommendation(data: AiRecommendRequest): Promise<AiRecommendResponse> {
    const response = await apiClient.post<AiRecommendResponse>('/recipes/ai-recommend', data)
    return response.data
  }

  async getTheMealDBCategories(): Promise<TheMealDBCategoriesResponse> {
    const response = await apiClient.get<TheMealDBCategoriesResponse>('/admin/recipes/themealdb/categories')
    return response.data
  }

  async browseTheMealDB(params: BrowseTheMealDBParams): Promise<BrowseTheMealDBResponse> {
    const response = await apiClient.get<BrowseTheMealDBResponse>('/admin/recipes/themealdb', { params })
    return response.data
  }

  async bulkImportRecipes(externalIds: string[]): Promise<BulkImportResult> {
    const response = await apiClient.post<BulkImportResult>('/admin/recipes/bulk-import', { externalIds })
    return response.data
  }

  async getMealData(): Promise<MealDataResponse> {
    const response = await apiClient.get<MealDataResponse>('/recipes/meal-data')
    return response.data
  }

  private briefCache = new Map<string, CookingBriefResponse>()
  private briefPending = new Map<string, Promise<CookingBriefResponse>>()

  async getCookingBrief(recipeId: string): Promise<CookingBriefResponse> {
    const hit = this.briefCache.get(recipeId)
    if (hit) return hit

    // Deduplicate concurrent callers — return the same in-flight promise
    const inflight = this.briefPending.get(recipeId)
    if (inflight) return inflight

    const promise = apiClient
      .post<CookingBriefResponse>(`/recipes/${recipeId}/cooking-brief`, {})
      .then((response) => {
        this.briefCache.set(recipeId, response.data)
        this.briefPending.delete(recipeId)
        return response.data
      })
      .catch((err: unknown) => {
        this.briefPending.delete(recipeId)
        throw err
      })

    this.briefPending.set(recipeId, promise)
    return promise
  }

  /**
   * Pre-seed the brief cache from a recipe response so the first getCookingBrief
   * call is a synchronous cache hit — no POST needed.
   */
  seedBriefCache(recipeId: string, brief: CookingBriefResponse): void {
    this.briefCache.set(recipeId, brief)
  }

  clearBriefCache() {
    this.briefCache.clear()
    this.briefPending.clear()
  }
}

export default new RecipesService()
