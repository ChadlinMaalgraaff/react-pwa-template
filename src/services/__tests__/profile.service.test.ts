import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import profileService from '../profile.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post' | 'put' | 'delete', ReturnType<typeof vi.fn>>

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getProfile calls GET /profile', async () => {
    const data = { id: '1', email: 'a@b.com', name: 'A', role: 'user' }
    mockedClient.get.mockResolvedValue({ data })

    const result = await profileService.getProfile()

    expect(mockedClient.get).toHaveBeenCalledWith('/profile')
    expect(result).toEqual(data)
  })

  it('updateProfile calls PUT /profile with the payload', async () => {
    const payload = { name: 'New Name' }
    const data = { id: '1', email: 'a@b.com', name: 'New Name', role: 'user' }
    mockedClient.put.mockResolvedValue({ data })

    const result = await profileService.updateProfile(payload)

    expect(mockedClient.put).toHaveBeenCalledWith('/profile', payload)
    expect(result).toEqual(data)
  })
})
