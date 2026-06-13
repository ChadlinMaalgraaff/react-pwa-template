import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import Profile from '@components/pages/Profile/Profile'
import { useProfile } from '@hooks/useProfile'
import { UserProfile } from '@/types/profile.types'

vi.mock('@hooks/useProfile')

const mockedUseProfile = useProfile as unknown as ReturnType<typeof vi.fn>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderProfile = (store = buildStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </Provider>
  )

const profile: UserProfile = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  role: 'user',
  preferredArea: 'Sandton',
  dietaryPreferences: ['Vegetarian'],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('Profile Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('shows a spinner while loading', () => {
    mockedUseProfile.mockReturnValue({ profile: null, isLoading: true, error: null, updateProfile: vi.fn() })
    renderProfile()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('renders the user details, preferred area and dietary preferences', () => {
    mockedUseProfile.mockReturnValue({ profile, isLoading: false, error: null, updateProfile: vi.fn() })
    renderProfile()

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('Suburb')).toHaveValue('Sandton')
    expect(screen.getByRole('button', { name: 'Vegetarian' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Vegan' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('saves changes when "Save changes" is clicked', async () => {
    const updateProfile = vi.fn().mockResolvedValue(profile)
    mockedUseProfile.mockReturnValue({ profile, isLoading: false, error: null, updateProfile })
    const user = userEvent.setup()
    renderProfile()

    await user.clear(screen.getByLabelText('Suburb'))
    await user.type(screen.getByLabelText('Suburb'), 'Cape Town')
    await user.click(screen.getByRole('button', { name: 'Vegan' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        preferredArea: 'Cape Town',
        dietaryPreferences: ['Vegetarian', 'Vegan'],
      })
    )
  })

  it('logs out and navigates to /login', async () => {
    mockedUseProfile.mockReturnValue({ profile, isLoading: false, error: null, updateProfile: vi.fn() })
    const store = buildStore()
    const user = userEvent.setup()
    renderProfile(store)

    await user.click(screen.getByRole('button', { name: 'Log out' }))

    expect(store.getState().auth.isAuthenticated).toBe(false)
    expect(navigateMock).toHaveBeenCalledWith('/login')
  })
})
