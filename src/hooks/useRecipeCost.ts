import { useState, useCallback } from 'react'
import recipesService from '@/services/recipes.service'
import { RecipeCostResponse } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipeCost = () => {
  const dispatch = useAppDispatch()
  const [cost, setCost] = useState<RecipeCostResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCost = useCallback(
    async (id: string, area?: string) => {
      try {
        setIsLoading(true)
        const data = await recipesService.getRecipeCost(id, area)
        setCost(data)
        return data
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [dispatch]
  )

  return { cost, isLoading, error, fetchCost }
}
