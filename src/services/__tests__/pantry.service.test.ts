import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import pantryService from '../pantry.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('pantryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listPantryItems calls GET /pantry', async () => {
    const data = [{ id: 'pi-1', ingredientId: 'ing-1', ingredientName: 'Onion', category: 'Vegetables', quantity: 3, unit: 'unit', source: 'manual', addedAt: '2026-06-01' }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await pantryService.listPantryItems()

    expect(mockedClient.get).toHaveBeenCalledWith('/pantry')
    expect(result).toEqual(data)
  })

  it('addPantryItems calls POST /pantry/items', async () => {
    const payload = { items: [{ ingredientId: 'ing-1', quantity: 3, unit: 'unit' }] }
    const data = [{ id: 'pi-1', ingredientId: 'ing-1', ingredientName: 'Onion', category: 'Vegetables', quantity: 3, unit: 'unit', source: 'manual', addedAt: '2026-06-01' }]
    mockedClient.post.mockResolvedValue({ data })

    const result = await pantryService.addPantryItems(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/pantry/items', payload)
    expect(result).toEqual(data)
  })

  it('updatePantryItem calls PUT /pantry/items/{id}', async () => {
    const payload = { quantity: 5 }
    const data = { id: 'pi-1', ingredientId: 'ing-1', ingredientName: 'Onion', category: 'Vegetables', quantity: 5, unit: 'unit', source: 'manual', addedAt: '2026-06-01' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await pantryService.updatePantryItem('pi-1', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/pantry/items/pi-1', payload)
    expect(result).toEqual(data)
  })

  it('deletePantryItem calls DELETE /pantry/items/{id}', async () => {
    const data = { id: 'pi-1', message: 'Pantry item deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await pantryService.deletePantryItem('pi-1')

    expect(mockedClient.delete).toHaveBeenCalledWith('/pantry/items/pi-1')
    expect(result).toEqual(data)
  })

  it('getPhotoUploadUrl calls POST /pantry/photo-upload-url', async () => {
    const payload = { contentType: 'image/jpeg' as const }
    const data = { uploadUrl: 'https://s3/...', key: 'pantry-photos/x.jpg', expiresIn: 300 }
    mockedClient.post.mockResolvedValue({ data })

    const result = await pantryService.getPhotoUploadUrl(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/pantry/photo-upload-url', payload)
    expect(result).toEqual(data)
  })

  it('analyzePhoto calls POST /pantry/photo-analyze with the key', async () => {
    const data = { suggestions: [] }
    mockedClient.post.mockResolvedValue({ data })

    const result = await pantryService.analyzePhoto('pantry-photos/x.jpg')

    expect(mockedClient.post).toHaveBeenCalledWith('/pantry/photo-analyze', { key: 'pantry-photos/x.jpg' })
    expect(result).toEqual(data)
  })
})
