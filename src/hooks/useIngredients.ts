import { useState, useEffect, useCallback } from 'react'
import ingredientsService from '@/services/ingredients.service'
import {
  Ingredient,
  ListIngredientsParams,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from '@/types/ingredients.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useIngredients = (initialParams: ListIngredientsParams = {}) => {
  const dispatch = useAppDispatch()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<ListIngredientsParams>(initialParams)

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true)
        const data = await ingredientsService.listIngredients(params)
        setIngredients(data)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchIngredients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, JSON.stringify(params)])

  const createIngredient = useCallback(
    async (data: CreateIngredientRequest) => {
      try {
        const created = await ingredientsService.createIngredient(data)
        setIngredients((prev) => [...prev, created])
        return created
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  const updateIngredient = useCallback(
    async (id: string, data: UpdateIngredientRequest) => {
      try {
        const updated = await ingredientsService.updateIngredient(id, data)
        setIngredients((prev) => prev.map((ingredient) => (ingredient.id === id ? updated : ingredient)))
        return updated
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  const deleteIngredient = useCallback(
    async (id: string) => {
      try {
        const result = await ingredientsService.deleteIngredient(id)
        setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id))
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      }
    },
    [dispatch]
  )

  return {
    ingredients,
    total: ingredients.length,
    isLoading,
    error,
    params,
    setParams,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  }
}
