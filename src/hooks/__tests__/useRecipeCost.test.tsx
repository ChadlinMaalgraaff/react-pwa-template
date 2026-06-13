import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipeCost } from '../useRecipeCost'
import { RecipeCostResponse } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    getRecipeCost: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<'getRecipeCost', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const costResponse: RecipeCostResponse = {
  recipeId: 'recipe-1',
  missingIngredients: [],
  cheapestSingleRetailer: null,
  cheapestCombination: { total: 0, byIngredient: {} },
  uncoveredIngredientIds: [],
}

describe('useRecipeCost', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is lazy until fetchCost is called', () => {
    const store = buildStore()
    const { result } = renderHook(() => useRecipeCost(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    expect(result.current.cost).toBeNull()
    expect(mockedService.getRecipeCost).not.toHaveBeenCalled()
  })

  it('fetchCost loads the cost breakdown', async () => {
    mockedService.getRecipeCost.mockResolvedValue(costResponse)
    const store = buildStore()
    const { result } = renderHook(() => useRecipeCost(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.fetchCost('recipe-1', 'Cape Town')
    })

    expect(mockedService.getRecipeCost).toHaveBeenCalledWith('recipe-1', 'Cape Town')
    expect(result.current.cost).toEqual(costResponse)
  })

  it('dispatches notification on error', async () => {
    mockedService.getRecipeCost.mockRejectedValue(new Error('Boom'))
    const store = buildStore()
    const { result } = renderHook(() => useRecipeCost(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await expect(result.current.fetchCost('recipe-1')).rejects.toThrow('Boom')
    })

    expect(result.current.error).toBe('Boom')
    expect(store.getState().ui.notification).toEqual({ message: 'Boom', type: 'error' })
  })
})
