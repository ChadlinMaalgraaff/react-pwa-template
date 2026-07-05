import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipeDetail } from '../useRecipeDetail'
import { RecipeDetail } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    getRecipe: vi.fn(),
    seedBriefCache: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<'getRecipe' | 'seedBriefCache', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const recipe: RecipeDetail = {
  id: 'recipe-1',
  title: 'Chicken Stew',
  description: null,
  instructions: ['Step 1'],
  imageUrl: null,
  cuisine: 'SA',
  prepTimeMinutes: 10,
  cookTimeMinutes: 40,
  servings: 4,
  isSaStaple: true,
  ingredients: [],
  imageAuthor: null,
  imageLicense: null,
  imageSourceUrl: null,
  sourceName: null,
  sourceUrl: null,
  sourceLicense: null,
  source: null,
}

const brief = {
  segments: [
    { type: 'intro' as const, index: 0, text: 'Welcome to Bobotie' },
    { type: 'step' as const, index: 1, stepIndex: 0, text: 'Brown the mince' },
  ],
}

describe('useRecipeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the recipe when id is provided', async () => {
    mockedService.getRecipe.mockResolvedValue(recipe)
    const store = buildStore()

    const { result } = renderHook(() => useRecipeDetail('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.recipe).toEqual(recipe)
    expect(mockedService.getRecipe).toHaveBeenCalledWith('recipe-1')
  })

  it('seeds the brief cache when the recipe response includes a cookingBrief', async () => {
    const recipeWithBrief = { ...recipe, cookingBrief: brief }
    mockedService.getRecipe.mockResolvedValue(recipeWithBrief)
    const store = buildStore()

    renderHook(() => useRecipeDetail('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(mockedService.seedBriefCache).toHaveBeenCalledWith('recipe-1', brief))
  })

  it('does not call seedBriefCache when cookingBrief is absent from the response', async () => {
    mockedService.getRecipe.mockResolvedValue(recipe)
    const store = buildStore()

    const { result } = renderHook(() => useRecipeDetail('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockedService.seedBriefCache).not.toHaveBeenCalled()
  })

  it('does not fetch when id is undefined', async () => {
    const store = buildStore()

    const { result } = renderHook(() => useRecipeDetail(undefined), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current.isLoading).toBe(false)
    expect(mockedService.getRecipe).not.toHaveBeenCalled()
  })

  it('dispatches notification on error', async () => {
    mockedService.getRecipe.mockRejectedValue(new Error('Not found'))
    const store = buildStore()

    const { result } = renderHook(() => useRecipeDetail('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Not found')
    expect(store.getState().ui.notification).toEqual({ message: 'Not found', type: 'error' })
  })
})
