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
})
