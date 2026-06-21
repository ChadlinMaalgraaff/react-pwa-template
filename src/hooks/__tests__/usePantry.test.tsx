import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import pantryService from '@/services/pantry.service'
import { usePantry } from '../usePantry'
import { PantryItem } from '@/types/pantry.types'

vi.mock('@/services/pantry.service', () => ({
  default: {
    listPantryItems: vi.fn(),
    addPantryItems: vi.fn(),
    updatePantryItem: vi.fn(),
    deletePantryItem: vi.fn(),
    clearPantry: vi.fn(),
  },
}))

const mockedService = pantryService as unknown as Record<
  'listPantryItems' | 'addPantryItems' | 'updatePantryItem' | 'deletePantryItem' | 'clearPantry',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const item: PantryItem = {
  id: 'item-1',
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  category: 'Grains',
  quantity: 2,
  unit: 'kg',
  source: 'manual',
  addedAt: '2026-06-01T00:00:00Z',
}

describe('usePantry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches items and sets pantry item count on mount', async () => {
    mockedService.listPantryItems.mockResolvedValue([item])
    const store = buildStore()

    const { result } = renderHook(() => usePantry(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.items).toEqual([item])
    expect(store.getState().pantry.itemCount).toBe(1)
  })

  it('addItem appends new items and updates pantry item count', async () => {
    mockedService.listPantryItems.mockResolvedValue([])
    const newItem = { ...item, id: 'item-2' }
    mockedService.addPantryItems.mockResolvedValue([newItem])
    const store = buildStore()

    const { result } = renderHook(() => usePantry(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addItem({ ingredientId: 'ing-1', quantity: 2, unit: 'kg' })
    })

    expect(result.current.items).toEqual([newItem])
    expect(store.getState().pantry.itemCount).toBe(1)
  })

  it('updateItem replaces the item in state', async () => {
    mockedService.listPantryItems.mockResolvedValue([item])
    const updated = { ...item, quantity: 5 }
    mockedService.updatePantryItem.mockResolvedValue(updated)
    const store = buildStore()

    const { result } = renderHook(() => usePantry(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateItem('item-1', { quantity: 5 })
    })

    expect(result.current.items).toEqual([updated])
  })

  it('removeItem removes the item and updates pantry item count', async () => {
    mockedService.listPantryItems.mockResolvedValue([item])
    mockedService.deletePantryItem.mockResolvedValue({ id: 'item-1', message: 'deleted' })
    const store = buildStore()

    const { result } = renderHook(() => usePantry(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.removeItem('item-1')
    })

    expect(result.current.items).toEqual([])
    expect(store.getState().pantry.itemCount).toBe(0)
  })

  it('clearAll clears all items and resets pantry item count', async () => {
    mockedService.listPantryItems.mockResolvedValue([item])
    mockedService.clearPantry.mockResolvedValue(undefined)
    const store = buildStore()

    const { result } = renderHook(() => usePantry(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.clearAll()
    })

    expect(result.current.items).toEqual([])
    expect(store.getState().pantry.itemCount).toBe(0)
  })
})
