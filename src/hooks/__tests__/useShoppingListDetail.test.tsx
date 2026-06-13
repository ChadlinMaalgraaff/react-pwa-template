import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import shoppingListsService from '@/services/shopping-lists.service'
import { useShoppingListDetail } from '../useShoppingListDetail'
import { ShoppingListDetail, ShoppingListItem } from '@/types/shopping-lists.types'

vi.mock('@/services/shopping-lists.service', () => ({
  default: {
    getShoppingList: vi.fn(),
    addShoppingListItems: vi.fn(),
    updateShoppingListItem: vi.fn(),
    deleteShoppingListItem: vi.fn(),
    addRecipeToShoppingList: vi.fn(),
  },
}))

const mockedService = shoppingListsService as unknown as Record<
  'getShoppingList' | 'addShoppingListItems' | 'updateShoppingListItem' | 'deleteShoppingListItem' | 'addRecipeToShoppingList',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const item: ShoppingListItem = {
  id: 'item-1',
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  recipeId: null,
  recipeTitle: null,
  quantity: 2,
  unit: 'kg',
  isChecked: false,
}

const listDetail: ShoppingListDetail = { id: 'list-1', name: 'Weekly Groceries', items: [item], createdAt: '2026-06-01T00:00:00Z' }

describe('useShoppingListDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the list when id is provided', async () => {
    mockedService.getShoppingList.mockResolvedValue(listDetail)
    const store = buildStore()

    const { result } = renderHook(() => useShoppingListDetail('list-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.list).toEqual(listDetail)
  })

  it('addItem appends new items', async () => {
    mockedService.getShoppingList.mockResolvedValue({ ...listDetail, items: [] })
    const newItem = { ...item, id: 'item-2' }
    mockedService.addShoppingListItems.mockResolvedValue([newItem])
    const store = buildStore()

    const { result } = renderHook(() => useShoppingListDetail('list-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addItem({ ingredientId: 'ing-1', quantity: 2, unit: 'kg' })
    })

    expect(result.current.list?.items).toEqual([newItem])
  })

  it('updateItem and removeItem mutate the list', async () => {
    mockedService.getShoppingList.mockResolvedValue(listDetail)
    const updated = { ...item, isChecked: true }
    mockedService.updateShoppingListItem.mockResolvedValue(updated)
    mockedService.deleteShoppingListItem.mockResolvedValue({ id: 'item-1', message: 'deleted' })
    const store = buildStore()

    const { result } = renderHook(() => useShoppingListDetail('list-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.updateItem('item-1', { isChecked: true })
    })

    expect(result.current.list?.items).toEqual([updated])

    await act(async () => {
      await result.current.removeItem('item-1')
    })

    expect(result.current.list?.items).toEqual([])
  })

  it('addFromRecipe appends added items', async () => {
    mockedService.getShoppingList.mockResolvedValue({ ...listDetail, items: [] })
    const addedItem = { ...item, recipeId: 'recipe-1', recipeTitle: 'Chicken Stew' }
    mockedService.addRecipeToShoppingList.mockResolvedValue({ addedItems: [addedItem], skippedAlreadyInPantry: [] })
    const store = buildStore()

    const { result } = renderHook(() => useShoppingListDetail('list-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.addFromRecipe('recipe-1')
    })

    expect(result.current.list?.items).toEqual([addedItem])
  })
})
