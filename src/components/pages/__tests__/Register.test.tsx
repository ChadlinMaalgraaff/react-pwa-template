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
import Register from '@components/pages/Register/Register'

vi.mock('@/services/auth.service', () => ({
  default: {
    register: vi.fn(),
  },
}))

const mockedAuthService = authService as unknown as Record<'register', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRegister = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </Provider>
  )

describe('Register Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('renders name, email, and password fields with a submit button', () => {
    renderRegister()
    expect(screen.getByLabelText('Name', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Email', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Password', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('navigates to /login on successful registration', async () => {
    mockedAuthService.register.mockResolvedValue({ token: 'token-123', user: {} })
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Name', { exact: false }), 'Jane Doe')
    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: false }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'))
  })

  it('shows an error message on failed registration', async () => {
    mockedAuthService.register.mockRejectedValue(new Error('Email already registered'))
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Name', { exact: false }), 'Jane Doe')
    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: false }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered')
  })
})
