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
    login: vi.fn(),
  },
}))

const mockedAuthService = authService as unknown as Record<'register' | 'login', ReturnType<typeof vi.fn>>

const completeLoginMock = vi.fn()

vi.mock('@hooks/useCompleteLogin', () => ({
  useCompleteLogin: () => completeLoginMock,
}))

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
    completeLoginMock.mockClear()
    mockedAuthService.register.mockReset()
    mockedAuthService.login.mockReset()
  })

  it('renders name, email, and password fields with a submit button', () => {
    renderRegister()
    expect(screen.getByLabelText('Name', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Email', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Password', { exact: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
  })

  it('logs the user straight in after a successful registration', async () => {
    mockedAuthService.register.mockResolvedValue({ message: 'Account created' })
    mockedAuthService.login.mockResolvedValue({
      accessToken: 'access-token-123',
      idToken: 'id-token-123',
      refreshToken: 'refresh-token-123',
      expiresIn: 3600,
      tokenType: 'Bearer',
    })
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Name', { exact: false }), 'Jane Doe')
    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() =>
      expect(mockedAuthService.login).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'password123' })
    )
    await waitFor(() => expect(completeLoginMock).toHaveBeenCalledWith('access-token-123'))
    expect(navigateMock).not.toHaveBeenCalled()
  })

  it('shows an error message on failed registration', async () => {
    mockedAuthService.register.mockRejectedValue(new Error('Email already registered'))
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Name', { exact: false }), 'Jane Doe')
    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email already registered')
    expect(mockedAuthService.login).not.toHaveBeenCalled()
  })

  it('falls back to /login with the email prefilled if auto-login fails after a successful registration', async () => {
    mockedAuthService.register.mockResolvedValue({ message: 'Account created' })
    mockedAuthService.login.mockRejectedValue(new Error('user not confirmed'))
    const user = userEvent.setup()
    renderRegister()

    await user.type(screen.getByLabelText('Name', { exact: false }), 'Jane Doe')
    await user.type(screen.getByLabelText('Email', { exact: false }), 'jane@example.com')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign up' }))

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/login', { state: { email: 'jane@example.com' } })
    )
    expect(completeLoginMock).not.toHaveBeenCalled()
  })
})
