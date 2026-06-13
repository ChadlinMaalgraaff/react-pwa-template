import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import shoppingListsService from '@/services/shopping-lists.service'
import { useShoppingLists } from '../useShoppingLists'
import { ShoppingListSummary, ShoppingListDetail } from '@/types/shopping-lists.types'

vi.mock('@/services/shopping-lists.service', () => ({
  default: {
    listShoppingLists: vi.fn(),
    createShoppingList: vi.fn(),
    deleteShoppingList: vi.fn(),
  },
}))

const mockedService = shoppingListsService as unknown as Record<
  'listShoppingLists' | 'createShoppingList' | 'deleteShoppingList',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const listSummary: ShoppingListSummary = { id: 'list-1', name: 'Weekly Groceries', itemCount: 2, createdAt: '2026-06-01T00:00:00Z' }

describe('useShoppingLists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches lists on mount', async () => {
    mockedService.listShoppingLists.mockResolvedValue([listSummary])
    const store = buildStore()

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.lists).toEqual([listSummary])
  })

  it('createList appends the new list', async () => {
    mockedService.listShoppingLists.mockResolvedValue([])
    const created: ShoppingListDetail = { id: 'list-2', name: 'New List', items: [], createdAt: '2026-06-02T00:00:00Z' }
    mockedService.createShoppingList.mockResolvedValue(created)
    const store = buildStore()

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createList({ name: 'New List' })
    })

    expect(result.current.lists).toEqual([{ id: 'list-2', name: 'New List', itemCount: 0, createdAt: '2026-06-02T00:00:00Z' }])
  })

  it('deleteList removes the list', async () => {
    mockedService.listShoppingLists.mockResolvedValue([listSummary])
    mockedService.deleteShoppingList.mockResolvedValue({ id: 'list-1', message: 'deleted' })
    const store = buildStore()

    const { result } = renderHook(() => useShoppingLists(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.deleteList('list-1')
    })

    expect(result.current.lists).toEqual([])
  })
})
