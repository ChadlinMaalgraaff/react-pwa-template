import { useState, useEffect } from 'react'
import recipesService from '@/services/recipes.service'
import { RecipeSummary, ListRecipesParams } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipes = (initialParams: ListRecipesParams = {}) => {
  const dispatch = useAppDispatch()
  const [recipes, setRecipes] = useState<RecipeSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListRecipesParams>(initialParams)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoading(true)
        const data = await recipesService.listRecipes(params)
        setRecipes(data.items)
        setTotal(data.total)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)])

  return { recipes, total, isLoading, error, params, setParams }
}
