import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipeMatch } from '../useRecipeMatch'
import { RecipeMatchPage } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    matchRecipes: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<'matchRecipes', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const page: RecipeMatchPage = {
  items: [
    {
      id: 'recipe-1',
      title: 'Chicken Stew',
      imageUrl: null,
      totalIngredients: 5,
      matchedIngredients: 4,
      missingIngredients: [{ ingredientId: 'ing-1', name: 'Onion' }],
      isFullyMakeable: false,
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
}

describe('useRecipeMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches matches on mount', async () => {
    mockedService.matchRecipes.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useRecipeMatch(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.matches).toEqual(page.items)
    expect(mockedService.matchRecipes).toHaveBeenCalledWith({})
  })

  it('refetch re-fetches matches', async () => {
    mockedService.matchRecipes.mockResolvedValue(page)
    const store = buildStore()

    const { result } = renderHook(() => useRecipeMatch({ maxMissing: 2 }), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockedService.matchRecipes).toHaveBeenCalledWith({ maxMissing: 2 })
    expect(mockedService.matchRecipes).toHaveBeenCalledTimes(2)
  })

  it('dispatches notification on error', async () => {
    mockedService.matchRecipes.mockRejectedValue(new Error('Boom'))
    const store = buildStore()

    const { result } = renderHook(() => useRecipeMatch(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Boom')
    expect(store.getState().ui.notification).toEqual({ message: 'Boom', type: 'error' })
  })
})
