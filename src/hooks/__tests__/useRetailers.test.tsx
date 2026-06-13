import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import retailersService from '@/services/retailers.service'
import { useRetailers } from '../useRetailers'
import { Retailer } from '@/types/retailers.types'

vi.mock('@/services/retailers.service', () => ({
  default: {
    listRetailers: vi.fn(),
    createRetailer: vi.fn(),
    updateRetailer: vi.fn(),
  },
}))

const mockedService = retailersService as unknown as Record<
  'listRetailers' | 'createRetailer' | 'updateRetailer',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const retailer: Retailer = { id: 'ret-1', name: 'Checkers', logoUrl: null }

describe('useRetailers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches retailers on mount', async () => {
    mockedService.listRetailers.mockResolvedValue([retailer])
    const store = buildStore()

    const { result } = renderHook(() => useRetailers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.retailers).toEqual([retailer])
  })

  it('createRetailer appends the new retailer', async () => {
    mockedService.listRetailers.mockResolvedValue([])
    const created = { ...retailer, id: 'ret-2' }
    mockedService.createRetailer.mockResolvedValue(created)
    const store = buildStore()

    const { result } = renderHook(() => useRetailers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createRetailer({ name: 'Pick n Pay' })
    })

    expect(result.current.retailers).toEqual([created])
  })

  it('updateRetailer replaces the retailer', async () => {
    mockedService.listRetailers.mockResolvedValue([retailer])
    const updated = { ...retailer, name: 'Checkers Sixty60' }
    mockedService.updateRetailer.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => useRetailers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateRetailer('ret-1', { name: 'Checkers Sixty60' })
    })

    expect(result.current.retailers).toEqual([updated])
  })

  it('dispatches notification on error', async () => {
    mockedService.listRetailers.mockRejectedValue(new Error('Boom'))
    const store = buildStore()

    const { result } = renderHook(() => useRetailers(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Boom')
    expect(store.getState().ui.notification).toEqual({ message: 'Boom', type: 'error' })
  })
})
