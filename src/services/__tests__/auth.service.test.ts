import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import authService from '../auth.service'

vi.mock('../api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'get' | 'post', ReturnType<typeof vi.fn>>

const tokens = {
  accessToken: 'access-123',
  idToken: 'id-123',
  refreshToken: 'refresh-123',
  expiresIn: 3600,
  tokenType: 'Bearer',
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login posts credentials to /auth/login', async () => {
    mockedClient.post.mockResolvedValue({ data: tokens })

    const result = await authService.login({ email: 'a@b.com', password: 'pw' })

    expect(mockedClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pw' })
    expect(result).toEqual(tokens)
  })

  it('loginWithGoogleCode posts the code to /auth/google/callback', async () => {
    mockedClient.post.mockResolvedValue({ data: tokens })

    const result = await authService.loginWithGoogleCode('auth-code-xyz')

    expect(mockedClient.post).toHaveBeenCalledWith('/auth/google/callback', { code: 'auth-code-xyz' })
    expect(result).toEqual(tokens)
  })
})
