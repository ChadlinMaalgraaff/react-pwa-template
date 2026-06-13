import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import specialsService from '@/services/specials.service'
import { useSpecials } from '../useSpecials'
import { SpecialsPage } from '@/types/specials.types'

vi.mock('@/services/specials.service', () => ({
  default: {
    listSpecials: vi.fn(),
    updateSpecial: vi.fn(),
    deleteSpecial: vi.fn(),
  },
}))

const mockedService = specialsService as unknown as Record<
  'listSpecials' | 'updateSpecial' | 'deleteSpecial',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const special = {
  id: 'spec-1',
  retailerId: 'ret-1',
  retailerName: 'Checkers',
  storeId: null,
  ingredientId: 'ing-1',
  ingredientName: 'Beef Mince',
  itemName: 'Beef Mince 500g',
  price: 54.99,
  unit: '500g',
  imageUrl: null,
  validFrom: '2026-06-09',
  validTo: '2026-06-15',
}

const page: SpecialsPage = { items: [special], page: 1, pageSize: 20, total: 1 }

describe('useSpecials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches specials on mount', async () => {
    mockedService.listSpecials.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useSpecials(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.specials).toEqual([special])
    expect(result.current.total).toBe(1)
  })

  it('refetches when params change', async () => {
    mockedService.listSpecials.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useSpecials(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setParams({ retailerId: 'ret-1' })
    })

    await waitFor(() => expect(mockedService.listSpecials).toHaveBeenCalledWith({ retailerId: 'ret-1' }))
  })

  it('updateSpecial replaces the special', async () => {
    mockedService.listSpecials.mockResolvedValue(page)
    const updated = { ...special, price: 49.99 }
    mockedService.updateSpecial.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => useSpecials(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateSpecial('spec-1', { price: 49.99 })
    })

    expect(result.current.specials).toEqual([updated])
  })

  it('deleteSpecial removes the special', async () => {
    mockedService.listSpecials.mockResolvedValue(page)
    mockedService.deleteSpecial.mockResolvedValue({ id: 'spec-1', message: 'deleted' })
    const store = buildStore()

    const { result } = renderHook(() => useSpecials(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteSpecial('spec-1')
    })

    expect(result.current.specials).toEqual([])
  })
})
