import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import profileService from '@/services/profile.service'
import { useProfile } from '../useProfile'
import { UserProfile } from '@/types/profile.types'

vi.mock('@/services/profile.service', () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

const mockedService = profileService as unknown as Record<'getProfile' | 'updateProfile', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const profile: UserProfile = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  preferredArea: null,
  dietaryPreferences: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches profile on mount', async () => {
    mockedService.getProfile.mockResolvedValue(profile)
    const store = buildStore()

    const { result } = renderHook(() => useProfile(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.profile).toEqual(profile)
    expect(store.getState().auth.user).toEqual(profile)
  })

  it('dispatches notification on fetch error', async () => {
    mockedService.getProfile.mockRejectedValue(new Error('Network error'))
    const store = buildStore()

    const { result } = renderHook(() => useProfile(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Network error')
    expect(store.getState().ui.notification).toEqual({ message: 'Network error', type: 'error' })
  })

  it('updateProfile updates local state and redux user', async () => {
    mockedService.getProfile.mockResolvedValue(profile)
    const updated = { ...profile, name: 'New Name' }
    mockedService.updateProfile.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => useProfile(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateProfile({ name: 'New Name' })
    })

    expect(result.current.profile).toEqual(updated)
    expect(store.getState().auth.user).toEqual(updated)
  })
})
