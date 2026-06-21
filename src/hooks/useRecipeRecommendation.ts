import { useState, useCallback } from 'react'
import recipesService from '@/services/recipes.service'
import { AiRecommendResponse, MatchedRecipe, RecommendGoal } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipeRecommendation = () => {
  const dispatch = useAppDispatch()
  const [recommendation, setRecommendation] = useState<AiRecommendResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recommend = useCallback(
    async (goal: RecommendGoal, recipes: MatchedRecipe[]) => {
      setIsLoading(true)
      setRecommendation(null)
      setError(null)
      try {
        const result = await recipesService.getAiRecommendation({ goal, recipes })
        setRecommendation(result)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch]
  )

  const clear = useCallback(() => {
    setRecommendation(null)
    setError(null)
  }, [])

  return { recommendation, isLoading, error, recommend, clear }
}
