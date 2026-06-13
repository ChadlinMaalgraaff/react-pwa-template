import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipeAdmin } from '../useRecipeAdmin'
import { RecipeDetail } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    createRecipe: vi.fn(),
    updateRecipe: vi.fn(),
    deleteRecipe: vi.fn(),
    importRecipe: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<
  'createRecipe' | 'updateRecipe' | 'deleteRecipe' | 'importRecipe',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const recipe: RecipeDetail = {
  id: 'recipe-1',
  title: 'Chicken Stew',
  description: null,
  instructions: [],
  imageUrl: null,
  cuisine: null,
  prepTimeMinutes: null,
  cookTimeMinutes: null,
  servings: null,
  isSaStaple: false,
  ingredients: [],
}

describe('useRecipeAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createRecipe calls the service and notifies success', async () => {
    mockedService.createRecipe.mockResolvedValue(recipe)
    const store = buildStore()
    const { result } = renderHook(() => useRecipeAdmin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.createRecipe({ title: 'Chicken Stew', instructions: [], ingredients: [] })
    })

    expect(mockedService.createRecipe).toHaveBeenCalled()
    expect(store.getState().ui.notification).toEqual({ message: 'Recipe created.', type: 'success' })
  })

  it('deleteRecipe calls the service and notifies success', async () => {
    mockedService.deleteRecipe.mockResolvedValue({ id: 'recipe-1', message: 'deleted' })
    const store = buildStore()
    const { result } = renderHook(() => useRecipeAdmin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.deleteRecipe('recipe-1')
    })

    expect(mockedService.deleteRecipe).toHaveBeenCalledWith('recipe-1')
    expect(store.getState().ui.notification).toEqual({ message: 'Recipe deleted.', type: 'success' })
  })

  it('dispatches an error notification when importRecipe fails', async () => {
    mockedService.importRecipe.mockRejectedValue(new Error('Import failed'))
    const store = buildStore()
    const { result } = renderHook(() => useRecipeAdmin(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await expect(result.current.importRecipe('ext-1')).rejects.toThrow('Import failed')
    })

    expect(result.current.error).toBe('Import failed')
    expect(store.getState().ui.notification).toEqual({ message: 'Import failed', type: 'error' })
  })
})
