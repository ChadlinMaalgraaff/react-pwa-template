import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import specialsService from '../specials.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('specialsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listSpecials calls GET /specials with params', async () => {
    const data = { items: [], page: 1, pageSize: 20, total: 0 }
    mockedClient.get.mockResolvedValue({ data })

    const result = await specialsService.listSpecials({ retailerId: 'ret-1', active: true })

    expect(mockedClient.get).toHaveBeenCalledWith('/specials', { params: { retailerId: 'ret-1', active: true } })
    expect(result).toEqual(data)
  })

  it('getSpecialsByIngredient calls GET /specials/ingredient/{id}', async () => {
    const data = [{ id: 'spec-1', retailerId: 'ret-1', retailerName: 'Checkers', itemName: 'Beef Mince 500g', price: 54.99, unit: '500g', validTo: '2026-06-15' }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await specialsService.getSpecialsByIngredient('ing-22')

    expect(mockedClient.get).toHaveBeenCalledWith('/specials/ingredient/ing-22')
    expect(result).toEqual(data)
  })

  it('createSpecials calls POST /admin/specials', async () => {
    const payload = { retailerId: 'ret-1', validFrom: '2026-06-09', validTo: '2026-06-15', items: [] }
    const data: unknown[] = []
    mockedClient.post.mockResolvedValue({ data })

    const result = await specialsService.createSpecials(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/specials', payload)
    expect(result).toEqual(data)
  })

  it('updateSpecial calls PUT /admin/specials/{id}', async () => {
    const payload = { ingredientId: 'ing-14' }
    const data = { id: 'spec-2', ingredientId: 'ing-14' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await specialsService.updateSpecial('spec-2', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/specials/spec-2', payload)
    expect(result).toEqual(data)
  })

  it('deleteSpecial calls DELETE /admin/specials/{id}', async () => {
    const data = { id: 'spec-2', message: 'Special deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await specialsService.deleteSpecial('spec-2')

    expect(mockedClient.delete).toHaveBeenCalledWith('/admin/specials/spec-2')
    expect(result).toEqual(data)
  })
})
