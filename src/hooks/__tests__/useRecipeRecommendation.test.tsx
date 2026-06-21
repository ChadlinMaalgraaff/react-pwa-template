import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import { useRecipeRecommendation } from '../useRecipeRecommendation'
import { MatchedRecipe } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    getAiRecommendation: vi.fn(),
  },
}))

const mockedService = recipesService as unknown as Record<
  'getAiRecommendation',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={buildStore()}>{children}</Provider>
)

const recipes: MatchedRecipe[] = [
  { id: 'recipe-1', title: 'Bobotie', imageUrl: null, totalIngredients: 5, matchedIngredients: 5, missingIngredients: [], isFullyMakeable: true },
  { id: 'recipe-2', title: 'Stir Fry', imageUrl: null, totalIngredients: 4, matchedIngredients: 3, missingIngredients: [{ ingredientId: 'ing-1', name: 'Soy Sauce' }], isFullyMakeable: false },
]

const recommendation = {
  recommendedRecipeId: 'recipe-1',
  rationale: 'Bobotie is fully makeable and high in protein.',
  goal: 'high-protein',
}

describe('useRecipeRecommendation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('recommend() calls the service and stores the result', async () => {
    mockedService.getAiRecommendation.mockResolvedValue(recommendation)

    const { result } = renderHook(() => useRecipeRecommendation(), { wrapper })

    await act(async () => {
      await result.current.recommend('high-protein', recipes)
    })

    expect(mockedService.getAiRecommendation).toHaveBeenCalledWith({
      goal: 'high-protein',
      recipes,
    })
    expect(result.current.recommendation).toEqual(recommendation)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('recommend() on error dispatches a notification and sets error state', async () => {
    mockedService.getAiRecommendation.mockRejectedValue(new Error('Network error'))
    const store = buildStore()

    const { result } = renderHook(() => useRecipeRecommendation(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.recommend('quick-cook', recipes)
    })

    expect(result.current.recommendation).toBeNull()
    expect(result.current.error).toBe('Network error')
    expect(store.getState().ui.notification).not.toBeNull()
  })

  it('clear() resets recommendation and error to null', async () => {
    mockedService.getAiRecommendation.mockResolvedValue(recommendation)

    const { result } = renderHook(() => useRecipeRecommendation(), { wrapper })

    await act(async () => {
      await result.current.recommend('cost-effective', recipes)
    })

    expect(result.current.recommendation).not.toBeNull()

    act(() => {
      result.current.clear()
    })

    expect(result.current.recommendation).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
