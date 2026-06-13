import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipes } from '../useRecipes'
import { RecipesPage } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    listRecipes: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<'listRecipes', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const page: RecipesPage = {
  items: [
    {
      id: 'recipe-1',
      title: 'Chicken Stew',
      imageUrl: null,
      cuisine: 'SA',
      prepTimeMinutes: 10,
      cookTimeMinutes: 40,
      servings: 4,
      isSaStaple: true,
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
}

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches recipes on mount', async () => {
    mockedService.listRecipes.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useRecipes(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.recipes).toEqual(page.items)
    expect(result.current.total).toBe(1)
  })

  it('refetches when params change', async () => {
    mockedService.listRecipes.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useRecipes(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setParams({ search: 'stew' })
    })

    await waitFor(() => expect(mockedService.listRecipes).toHaveBeenCalledWith({ search: 'stew' }))
  })

  it('dispatches notification on error', async () => {
    mockedService.listRecipes.mockRejectedValue(new Error('Boom'))
    const store = buildStore()

    const { result } = renderHook(() => useRecipes(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Boom')
    expect(store.getState().ui.notification).toEqual({ message: 'Boom', type: 'error' })
  })
})
