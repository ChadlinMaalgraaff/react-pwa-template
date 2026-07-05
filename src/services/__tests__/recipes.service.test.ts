import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import recipesService from '../recipes.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('recipesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    recipesService.clearBriefCache()
  })

  it('listRecipes calls GET /recipes with params', async () => {
    const data = { items: [], page: 1, pageSize: 20, total: 0 }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.listRecipes({ search: 'bobotie' })

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes', { params: { search: 'bobotie' } })
    expect(result).toEqual(data)
  })

  it('matchRecipes calls GET /recipes/match with params', async () => {
    const data = { items: [], page: 1, pageSize: 20, total: 0 }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.matchRecipes({ maxMissing: 2 })

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes/match', { params: { maxMissing: 2 } })
    expect(result).toEqual(data)
  })

  it('matchRecipes passes through nutrition and mealTypes fields unchanged', async () => {
    const enriched = {
      id: 'recipe-1',
      title: 'Bobotie',
      imageUrl: null,
      totalIngredients: 8,
      matchedIngredients: 8,
      missingIngredients: [],
      isFullyMakeable: true,
      calories: 400,
      protein: 25,
      fat: 30,
      carbs: 20,
      mealTypes: ['supper', 'lunch'],
    }
    const unenriched = {
      id: 'recipe-2',
      title: 'Mystery Stew',
      imageUrl: null,
      totalIngredients: 5,
      matchedIngredients: 4,
      missingIngredients: [{ ingredientId: 'ing-1', name: 'Salt' }],
      isFullyMakeable: false,
    }
    const data = { items: [enriched, unenriched], page: 1, pageSize: 20, total: 2 }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.matchRecipes({ maxMissing: 1 })

    expect(result.items[0]).toEqual(enriched)
    expect(result.items[1].calories).toBeUndefined()
    expect(result.items[1].mealTypes).toBeUndefined()
  })

  it('getRecipe calls GET /recipes/{id}', async () => {
    const data = { id: 'rec-1', title: 'Bobotie' }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.getRecipe('rec-1')

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes/rec-1')
    expect(result).toEqual(data)
  })

  it('getRecipeCost calls GET /recipes/{id}/cost with optional area', async () => {
    const data = { recipeId: 'rec-1' }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.getRecipeCost('rec-1', 'Observatory')

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes/rec-1/cost', { params: { area: 'Observatory' } })
    expect(result).toEqual(data)
  })

  it('getRecipeCost omits area when not provided', async () => {
    const data = { recipeId: 'rec-1' }
    mockedClient.get.mockResolvedValue({ data })

    await recipesService.getRecipeCost('rec-1')

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes/rec-1/cost', { params: {} })
  })

  it('createRecipe calls POST /admin/recipes', async () => {
    const payload = { title: 'Bobotie', instructions: ['Step 1'], ingredients: [] }
    const data = { id: 'rec-1', ...payload }
    mockedClient.post.mockResolvedValue({ data })

    const result = await recipesService.createRecipe(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/recipes', payload)
    expect(result).toEqual(data)
  })

  it('updateRecipe calls PUT /admin/recipes/{id}', async () => {
    const payload = { title: 'Updated' }
    const data = { id: 'rec-1', title: 'Updated' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await recipesService.updateRecipe('rec-1', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/recipes/rec-1', payload)
    expect(result).toEqual(data)
  })

  it('deleteRecipe calls DELETE /admin/recipes/{id}', async () => {
    const data = { id: 'rec-1', message: 'Recipe deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await recipesService.deleteRecipe('rec-1')

    expect(mockedClient.delete).toHaveBeenCalledWith('/admin/recipes/rec-1')
    expect(result).toEqual(data)
  })

  it('importRecipe calls POST /admin/recipes/import', async () => {
    const data = { id: 'rec-2', title: 'Imported' }
    mockedClient.post.mockResolvedValue({ data })

    const result = await recipesService.importRecipe('52772')

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/recipes/import', { externalId: '52772' })
    expect(result).toEqual(data)
  })

  it('getMealData calls GET /recipes/meal-data', async () => {
    const data = {
      total: 1,
      recipes: [
        {
          id: 'rec-1', title: 'Bobotie', cuisine: 'Cape Malay',
          prepTimeMinutes: 20, cookTimeMinutes: 45, servings: 6,
          calories: 400, protein: 25, fat: 30, carbs: 20,
          mealTypes: ['lunch', 'supper'], isSaStaple: true,
        },
      ],
    }
    mockedClient.get.mockResolvedValue({ data })

    const result = await recipesService.getMealData()

    expect(mockedClient.get).toHaveBeenCalledWith('/recipes/meal-data')
    expect(result).toEqual(data)
  })

  it('getCookingBrief calls POST /recipes/:id/cooking-brief', async () => {
    const data = {
      segments: [
        { type: 'intro', index: 0, text: 'Welcome' },
        { type: 'step', index: 1, stepIndex: 0, text: 'Brown the mince' },
      ],
    }
    mockedClient.post.mockResolvedValue({ data })

    const result = await recipesService.getCookingBrief('rec-1')

    expect(mockedClient.post).toHaveBeenCalledWith('/recipes/rec-1/cooking-brief', {})
    expect(result).toEqual(data)
  })

  it('getCookingBrief returns cached result on second call without hitting the API', async () => {
    const data = { segments: [{ type: 'intro', index: 0, text: 'Welcome' }] }
    mockedClient.post.mockResolvedValue({ data })

    const first = await recipesService.getCookingBrief('rec-1')
    const second = await recipesService.getCookingBrief('rec-1')

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('seedBriefCache makes a subsequent getCookingBrief return immediately without hitting the API', async () => {
    const brief = { segments: [{ type: 'intro' as const, index: 0, text: 'Pre-cached' }] }

    recipesService.seedBriefCache('rec-1', brief)
    const result = await recipesService.getCookingBrief('rec-1')

    expect(mockedClient.post).not.toHaveBeenCalled()
    expect(result).toBe(brief)
  })

  it('getCookingBrief deduplicates concurrent calls for the same recipe', async () => {
    const data = { segments: [{ type: 'intro', index: 0, text: 'Welcome' }] }
    mockedClient.post.mockResolvedValue({ data })

    const [a, b] = await Promise.all([
      recipesService.getCookingBrief('rec-1'),
      recipesService.getCookingBrief('rec-1'),
    ])

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })
})
