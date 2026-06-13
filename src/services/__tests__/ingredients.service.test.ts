import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import ingredientsService from '../ingredients.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('ingredientsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listIngredients calls GET /ingredients with params', async () => {
    const data = [{ id: 'ing-1', name: 'Onion', category: 'Vegetables', defaultUnit: 'unit', aliases: [] }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await ingredientsService.listIngredients({ search: 'onion' })

    expect(mockedClient.get).toHaveBeenCalledWith('/ingredients', { params: { search: 'onion' } })
    expect(result).toEqual(data)
  })

  it('createIngredient calls POST /admin/ingredients', async () => {
    const payload = { name: 'Butternut', defaultUnit: 'unit' }
    const data = { id: 'ing-2', ...payload, category: null, aliases: [] }
    mockedClient.post.mockResolvedValue({ data })

    const result = await ingredientsService.createIngredient(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/ingredients', payload)
    expect(result).toEqual(data)
  })

  it('updateIngredient calls PUT /admin/ingredients/{id}', async () => {
    const payload = { aliases: ['brinjal'] }
    const data = { id: 'ing-2', name: 'Eggplant', category: null, defaultUnit: 'unit', aliases: ['brinjal'] }
    mockedClient.put.mockResolvedValue({ data })

    const result = await ingredientsService.updateIngredient('ing-2', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/ingredients/ing-2', payload)
    expect(result).toEqual(data)
  })

  it('deleteIngredient calls DELETE /admin/ingredients/{id}', async () => {
    const data = { id: 'ing-2', message: 'Ingredient deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await ingredientsService.deleteIngredient('ing-2')

    expect(mockedClient.delete).toHaveBeenCalledWith('/admin/ingredients/ing-2')
    expect(result).toEqual(data)
  })
})
