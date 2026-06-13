import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import retailersService from '@/services/retailers.service'
import { useStores } from '../useStores'
import { Store } from '@/types/retailers.types'

vi.mock('@/services/retailers.service', () => ({
  default: {
    listStores: vi.fn(),
    createStore: vi.fn(),
    updateStore: vi.fn(),
    deleteStore: vi.fn(),
  },
}))

const mockedService = retailersService as unknown as Record<
  'listStores' | 'createStore' | 'updateStore' | 'deleteStore',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const store1: Store = {
  id: 'store-1',
  retailerId: 'ret-1',
  retailerName: 'Checkers',
  branchName: 'Sea Point',
  suburb: 'Sea Point',
  city: 'Cape Town',
}

describe('useStores', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts empty and does not fetch automatically', () => {
    const store = buildStore()
    const { result } = renderHook(() => useStores(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current.stores).toEqual([])
    expect(mockedService.listStores).not.toHaveBeenCalled()
  })

  it('fetchStoresForRetailer loads stores for the retailer', async () => {
    mockedService.listStores.mockResolvedValue([store1])
    const store = buildStore()
    const { result } = renderHook(() => useStores(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.fetchStoresForRetailer('ret-1')
    })

    expect(mockedService.listStores).toHaveBeenCalledWith({ retailerId: 'ret-1' })
    expect(result.current.stores).toEqual([store1])
  })

  it('createStore appends the new store', async () => {
    const created = { ...store1, id: 'store-2' }
    mockedService.createStore.mockResolvedValue(created)
    const store = buildStore()
    const { result } = renderHook(() => useStores(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.createStore({ retailerId: 'ret-1', branchName: 'Camps Bay' })
    })

    expect(result.current.stores).toEqual([created])
  })

  it('updateStore replaces and deleteStore removes the store', async () => {
    mockedService.listStores.mockResolvedValue([store1])
    const updated = { ...store1, branchName: 'Sea Point Main' }
    mockedService.updateStore.mockResolvedValue(updated)
    mockedService.deleteStore.mockResolvedValue({ id: 'store-1', message: 'deleted' })
    const store = buildStore()
    const { result } = renderHook(() => useStores(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.fetchStoresForRetailer('ret-1')
    })

    await act(async () => {
      await result.current.updateStore('store-1', { branchName: 'Sea Point Main' })
    })

    expect(result.current.stores).toEqual([updated])

    await act(async () => {
      await result.current.deleteStore('store-1')
    })

    expect(result.current.stores).toEqual([])
  })
})
