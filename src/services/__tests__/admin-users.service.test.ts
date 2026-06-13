import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import adminUsersService from '../admin-users.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('adminUsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listUsers calls GET /admin/users with params', async () => {
    const data = { items: [], page: 1, pageSize: 20, total: 0 }
    mockedClient.get.mockResolvedValue({ data })

    const result = await adminUsersService.listUsers({ search: 'thandi' })

    expect(mockedClient.get).toHaveBeenCalledWith('/admin/users', { params: { search: 'thandi' } })
    expect(result).toEqual(data)
  })

  it('updateUserRole calls PUT /admin/users/{id}/role', async () => {
    const data = { id: 'u-1', email: 'a@b.com', name: 'A', role: 'admin', createdAt: '2026-01-10' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await adminUsersService.updateUserRole('u-1', 'admin')

    expect(mockedClient.put).toHaveBeenCalledWith('/admin/users/u-1/role', { role: 'admin' })
    expect(result).toEqual(data)
  })
})
