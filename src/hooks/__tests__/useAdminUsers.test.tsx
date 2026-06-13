import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import adminUsersService from '@/services/admin-users.service'
import { useAdminUsers } from '../useAdminUsers'
import { AdminUsersPage } from '@/types/admin-users.types'

vi.mock('@/services/admin-users.service', () => ({
  default: {
    listUsers: vi.fn(),
    updateUserRole: vi.fn(),
  },
}))

const mockedService = adminUsersService as unknown as Record<'listUsers' | 'updateUserRole', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const user = { id: 'user-1', email: 'user@example.com', name: 'Test User', role: 'user' as const, createdAt: '2026-01-01T00:00:00Z' }

const page: AdminUsersPage = { items: [user], page: 1, pageSize: 20, total: 1 }

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches users on mount', async () => {
    mockedService.listUsers.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.users).toEqual([user])
    expect(result.current.total).toBe(1)
  })

  it('refetches when params change', async () => {
    mockedService.listUsers.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setParams({ search: 'test' })
    })

    await waitFor(() => expect(mockedService.listUsers).toHaveBeenCalledWith({ search: 'test' }))
  })

  it('updateUserRole replaces the user', async () => {
    mockedService.listUsers.mockResolvedValue(page)
    const updated = { ...user, role: 'admin' as const }
    mockedService.updateUserRole.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateUserRole('user-1', 'admin')
    })

    expect(result.current.users).toEqual([updated])
  })

  it('dispatches notification on error', async () => {
    mockedService.listUsers.mockRejectedValue(new Error('Boom'))
    const store = buildStore()

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Boom')
    expect(store.getState().ui.notification).toEqual({ message: 'Boom', type: 'error' })
  })
})
