import { useState, useCallback } from 'react'
import specialsService from '@/services/specials.service'
import { CreateSpecialsRequest } from '@/types/specials.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const useSpecialsUpload = () => {
  const dispatch = useAppDispatch()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadSpecials = useCallback(
    async (data: CreateSpecialsRequest) => {
      try {
        setIsSaving(true)
        const specials = await specialsService.createSpecials(data)
        dispatch(setNotification({ message: 'Specials uploaded.', type: 'success' }))
        return specials
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

  return { uploadSpecials, isSaving, error }
}
