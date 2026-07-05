import { useState, useEffect } from 'react'
import recipesService from '@/services/recipes.service'
import { RecipeDetail } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipeDetail = (id: string | undefined) => {
  const dispatch = useAppDispatch()
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchRecipe = async () => {
      try {
        setIsLoading(true)
        const data = await recipesService.getRecipe(id)
        if (data.cookingBrief) {
          recipesService.seedBriefCache(data.id, data.cookingBrief)
        }
        setRecipe(data)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipe()
  }, [dispatch, id])

  return { recipe, isLoading, error }
}
