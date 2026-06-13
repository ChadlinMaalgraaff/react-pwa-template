import { useState, useEffect, useCallback } from 'react'
import recipesService from '@/services/recipes.service'
import { MatchedRecipe, MatchRecipesParams } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipeMatch = (params: MatchRecipesParams = {}) => {
  const dispatch = useAppDispatch()
  const [matches, setMatches] = useState<MatchedRecipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await recipesService.matchRecipes(params)
      setMatches(data.items)
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      dispatch(setNotification({ message, type: 'error' }))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return { matches, isLoading, error, refetch: fetchMatches }
}
