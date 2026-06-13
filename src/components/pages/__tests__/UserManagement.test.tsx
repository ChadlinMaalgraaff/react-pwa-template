import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer, { setUser } from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import adminUsersService from '@/services/admin-users.service'
import UserManagement from '@components/pages/UserManagement/UserManagement'
import { AdminUserSummary } from '@/types/admin-users.types'

vi.mock('@/services/admin-users.service', () => ({
  default: {
    listUsers: vi.fn(),
    updateUserRole: vi.fn(),
  },
}))

const mockedAdminUsersService = adminUsersService as unknown as Record<
  'listUsers' | 'updateUserRole',
  ReturnType<typeof vi.fn>
>

const users: AdminUserSummary[] = [
  { id: 'user-1', email: 'admin@pantrypal.app', name: 'Admin User', role: 'admin', createdAt: '2026-01-01' },
  { id: 'user-2', email: 'jane@pantrypal.app', name: 'Jane Doe', role: 'user', createdAt: '2026-02-01' },
]

const buildStore = () => {
  const store = configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })
  store.dispatch(
    setUser({
      id: 'user-1',
      email: 'admin@pantrypal.app',
      name: 'Admin User',
      role: 'admin',
      preferredArea: null,
      dietaryPreferences: [],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    })
  )
  return store
}

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    </Provider>
  )

describe('UserManagement Page', () => {
  beforeEach(() => {
    mockedAdminUsersService.listUsers.mockResolvedValue({ items: users, total: 2, page: 1, pageSize: 10 })
    mockedAdminUsersService.updateUserRole.mockResolvedValue({ ...users[1], role: 'admin' })
  })

  it('renders users with role badges', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Admin User')).toBeInTheDocument())
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Admin', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('User', { selector: 'span' })).toBeInTheDocument()
  })

  it('disables the role toggle for the current user', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Admin User')).toBeInTheDocument())

    const rows = screen.getAllByRole('row')
    const adminRow = rows.find((row) => row.textContent?.includes('Admin User'))
    const toggleButton = adminRow?.querySelector('button')
    expect(toggleButton).toBeDisabled()
  })

  it('promotes a user to admin after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Make Admin' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Make Admin' }))

    await waitFor(() => expect(mockedAdminUsersService.updateUserRole).toHaveBeenCalledWith('user-2', 'admin'))
  })

  it('searches users by name or email', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument())

    await user.type(screen.getByPlaceholderText('Search by name or email...'), 'jane')

    await waitFor(() =>
      expect(mockedAdminUsersService.listUsers).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, search: 'jane' })
    )
  })
})
