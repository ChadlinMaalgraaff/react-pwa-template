import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import profileService from '@/services/profile.service'
import Onboarding from '@components/pages/Onboarding/Onboarding'

vi.mock('@/services/profile.service', () => ({
  default: {
    updateProfile: vi.fn(),
  },
}))

const mockedProfileService = profileService as unknown as Record<'updateProfile', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderOnboarding = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Onboarding />
      </MemoryRouter>
    </Provider>
  )

describe('Onboarding Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedProfileService.updateProfile.mockResolvedValue({})
  })

  it('shows step 1 with the suburb input', () => {
    renderOnboarding()
    expect(screen.getByText('Where do you usually shop?')).toBeInTheDocument()
    expect(screen.getByLabelText('Suburb')).toBeInTheDocument()
  })

  it('advances to step 2 and selects dietary preferences', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.type(screen.getByLabelText('Suburb'), 'Sandton')
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Any dietary preferences?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vegetarian' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))

    await waitFor(() =>
      expect(mockedProfileService.updateProfile).toHaveBeenCalledWith({
        preferredArea: 'Sandton',
        dietaryPreferences: ['Vegetarian'],
      })
    )
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/pantry'))
  })

  it('skips onboarding without saving preferences', async () => {
    const user = userEvent.setup()
    renderOnboarding()

    await user.click(screen.getByRole('button', { name: 'Skip' }))

    await waitFor(() => expect(mockedProfileService.updateProfile).toHaveBeenCalledWith({}))
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/pantry'))
  })
})
