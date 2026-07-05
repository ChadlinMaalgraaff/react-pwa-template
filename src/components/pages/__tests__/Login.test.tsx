import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import authService from '@/services/auth.service'
import profileService from '@/services/profile.service'
import Login from '@components/pages/Login/Login'
import { ONBOARDING_STORAGE_KEY } from '@components/pages/HowItWorksCarousel/HowItWorksCarousel'
import { redirectToGoogleSignIn } from '@utils/googleAuth'
import { UserProfile } from '@/types/profile.types'

vi.mock('@/services/auth.service', () => ({
  default: {
    login: vi.fn(),
  },
}))

vi.mock('@/services/profile.service', () => ({
  default: {
    getProfile: vi.fn(),
  },
}))

vi.mock('@utils/googleAuth', () => ({
  redirectToGoogleSignIn: vi.fn(),
}))

const mockedAuthService = authService as unknown as Record<'login', ReturnType<typeof vi.fn>>
const mockedProfileService = profileService as unknown as Record<'getProfile', ReturnType<typeof vi.fn>>
const mockedRedirectToGoogleSignIn = redirectToGoogleSignIn as unknown as ReturnType<typeof vi.fn>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

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

const renderLogin = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </Provider>
  )

const renderLoginWithState = (state: Record<string, unknown>) =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
        <Login />
      </MemoryRouter>
    </Provider>
  )

describe('Login Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    localStorage.clear()
  })

  it('renders email and password fields with a submit button', () => {
    renderLogin()
    expect(screen.getByLabelText('Email', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Password', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
  })

  it('navigates to /how-it-works on first login for a regular user', async () => {
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    })
    mockedProfileService.getProfile.mockResolvedValue(userProfile)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/how-it-works'))
  })

  it('navigates to /staples on login when onboarding already seen', async () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    })
    mockedProfileService.getProfile.mockResolvedValue(userProfile)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/staples'))
  })

  it('navigates to /admin on successful login for an admin user', async () => {
    const adminProfile = { ...userProfile, role: 'admin' as const }
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    })
    mockedProfileService.getProfile.mockResolvedValue(adminProfile)
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email', { exact: false }), 'admin@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/admin'))
  })

  it('prefills the email when arriving with a location state (e.g. fallback from registration)', () => {
    renderLoginWithState({ email: 'jane@example.com' })

    expect(screen.getByLabelText('Email', { exact: false })).toHaveValue('jane@example.com')
  })

  it('starts Google sign-in when the Continue with Google button is clicked', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /continue with google/i }))

    expect(mockedRedirectToGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('shows an error message on failed login', async () => {
    mockedAuthService.login.mockRejectedValue(new Error('Invalid credentials'))
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })
})
