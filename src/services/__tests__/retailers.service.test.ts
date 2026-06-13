import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import retailersService from '../retailers.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('retailersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listRetailers calls GET /retailers', async () => {
    const data = [{ id: 'ret-1', name: 'Checkers', logoUrl: null }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await retailersService.listRetailers()

    expect(mockedClient.get).toHaveBeenCalledWith('/retailers')
    expect(result).toEqual(data)
  })

  it('createRetailer calls POST /admin/retailers', async () => {
    const payload = { name: "Food Lover's Market" }
    const data = { id: 'ret-2', ...payload, logoUrl: null }
    mockedClient.post.mockResolvedValue({ data })

    const result = await retailersService.createRetailer(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/retailers', payload)
    expect(result).toEqual(data)
  })

  it('updateRetailer calls PUT /admin/retailers/{id}', async () => {
    const payload = { name: 'Updated' }
    const data = { id: 'ret-2', name: 'Updated', logoUrl: null }
    mockedClient.put.mockResolvedValue({ data })

    const result = await retailersService.updateRetailer('ret-2', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/retailers/ret-2', payload)
    expect(result).toEqual(data)
  })

  it('listStores calls GET /stores with params', async () => {
    const data = [{ id: 'store-1', retailerId: 'ret-1', retailerName: 'Checkers', branchName: 'Checkers Claremont', suburb: 'Claremont', city: 'Cape Town' }]
    mockedClient.get.mockResolvedValue({ data })

    const result = await retailersService.listStores({ retailerId: 'ret-1' })

    expect(mockedClient.get).toHaveBeenCalledWith('/stores', { params: { retailerId: 'ret-1' } })
    expect(result).toEqual(data)
  })

  it('createStore calls POST /admin/stores', async () => {
    const payload = { retailerId: 'ret-1', branchName: 'Checkers Claremont' }
    const data = { id: 'store-1', retailerId: 'ret-1', retailerName: 'Checkers', branchName: 'Checkers Claremont', suburb: null, city: 'Cape Town' }
    mockedClient.post.mockResolvedValue({ data })

    const result = await retailersService.createStore(payload)

    expect(mockedClient.post).toHaveBeenCalledWith('/admin/stores', payload)
    expect(result).toEqual(data)
  })

  it('updateStore calls PUT /admin/stores/{id}', async () => {
    const payload = { suburb: 'Observatory' }
    const data = { id: 'store-1', retailerId: 'ret-1', retailerName: 'Checkers', branchName: 'Checkers Claremont', suburb: 'Observatory', city: 'Cape Town' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await retailersService.updateStore('store-1', payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/stores/store-1', payload)
    expect(result).toEqual(data)
  })

  it('deleteStore calls DELETE /admin/stores/{id}', async () => {
    const data = { id: 'store-1', message: 'Store deleted.' }
    mockedClient.delete.mockResolvedValue({ data })

    const result = await retailersService.deleteStore('store-1')

    expect(mockedClient.delete).toHaveBeenCalledWith('/admin/stores/store-1')
    expect(result).toEqual(data)
  })
})
