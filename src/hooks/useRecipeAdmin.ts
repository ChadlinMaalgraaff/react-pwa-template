import { useState, useCallback } from 'react'
import recipesService from '@/services/recipes.service'
import { CreateRecipeRequest, UpdateRecipeRequest } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useRecipeAdmin = () => {
  const dispatch = useAppDispatch()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRecipe = useCallback(
    async (data: CreateRecipeRequest) => {
      try {
        setIsSaving(true)
        const recipe = await recipesService.createRecipe(data)
        dispatch(setNotification({ message: 'Recipe created.', type: 'success' }))
        return recipe
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch]
  )

  const updateRecipe = useCallback(
    async (id: string, data: UpdateRecipeRequest) => {
      try {
        setIsSaving(true)
        const recipe = await recipesService.updateRecipe(id, data)
        dispatch(setNotification({ message: 'Recipe updated.', type: 'success' }))
        return recipe
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch]
  )

  const deleteRecipe = useCallback(
    async (id: string) => {
      try {
        setIsSaving(true)
        const result = await recipesService.deleteRecipe(id)
        dispatch(setNotification({ message: 'Recipe deleted.', type: 'success' }))
        return result
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch]
  )

  const importRecipe = useCallback(
    async (externalId: string) => {
      try {
        setIsSaving(true)
        const recipe = await recipesService.importRecipe(externalId)
        dispatch(setNotification({ message: 'Recipe imported.', type: 'success' }))
        return recipe
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [dispatch]
  )

  return { createRecipe, updateRecipe, deleteRecipe, importRecipe, isSaving, error }
}
