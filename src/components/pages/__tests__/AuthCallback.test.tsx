import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import authService from '@/services/auth.service'
import profileService from '@/services/profile.service'
import { consumeOAuthState } from '@utils/googleAuth'
import AuthCallback from '@components/pages/AuthCallback/AuthCallback'
import { UserProfile } from '@/types/profile.types'

vi.mock('@/services/auth.service', () => ({
  default: { loginWithGoogleCode: vi.fn() },
}))

vi.mock('@/services/profile.service', () => ({
  default: { getProfile: vi.fn() },
}))

vi.mock('@utils/googleAuth', () => ({
  consumeOAuthState: vi.fn(),
}))

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const mockedAuth = authService as unknown as Record<'loginWithGoogleCode', ReturnType<typeof vi.fn>>
const mockedProfile = profileService as unknown as Record<'getProfile', ReturnType<typeof vi.fn>>
const mockedConsumeState = consumeOAuthState as unknown as ReturnType<typeof vi.fn>

const tokens = { accessToken: 'access-123', idToken: 'id', refreshToken: 'r', expiresIn: 3600, tokenType: 'Bearer' }

const userProfile: UserProfile = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane',
  role: 'user',
  preferredArea: null,
  dietaryPreferences: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const renderCallback = (queryString: string) =>
  render(
    <Provider store={configureStore({ reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer } })}>
      <MemoryRouter initialEntries={[`/auth/callback${queryString}`]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )

describe('AuthCallback Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('exchanges the code and routes the user in on success', async () => {
    mockedConsumeState.mockReturnValue(true)
    mockedAuth.loginWithGoogleCode.mockResolvedValue(tokens)
    mockedProfile.getProfile.mockResolvedValue(userProfile)

    renderCallback('?code=abc&state=xyz')

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/how-it-works'))
    expect(mockedAuth.loginWithGoogleCode).toHaveBeenCalledWith('abc')
  })

  it('shows an error and does not exchange when the state is invalid', async () => {
    mockedConsumeState.mockReturnValue(false)

    renderCallback('?code=abc&state=tampered')

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not verify/i)
    expect(mockedAuth.loginWithGoogleCode).not.toHaveBeenCalled()
  })

  it('shows an error when the authorization code is missing', async () => {
    mockedConsumeState.mockReturnValue(true)

    renderCallback('?state=xyz')

    expect(await screen.findByRole('alert')).toHaveTextContent(/missing authorization code/i)
    expect(mockedAuth.loginWithGoogleCode).not.toHaveBeenCalled()
  })

  it('shows an error when Cognito returns an error param', async () => {
    renderCallback('?error=access_denied')

    expect(await screen.findByRole('alert')).toHaveTextContent(/cancelled or failed/i)
    expect(mockedConsumeState).not.toHaveBeenCalled()
  })

  it('shows an error when the backend exchange fails', async () => {
    mockedConsumeState.mockReturnValue(true)
    mockedAuth.loginWithGoogleCode.mockRejectedValue(new Error('boom'))

    renderCallback('?code=abc&state=xyz')

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not complete/i)
  })
})
