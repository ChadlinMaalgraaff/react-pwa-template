import { useState, useCallback } from 'react'
import pantryService from '@/services/pantry.service'
import { PhotoAnalyzeResponse, PhotoContentType } from '@/types/pantry.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'

export const usePantryCapture = () => {
  const dispatch = useAppDispatch()
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true)
        const { uploadUrl, key } = await pantryService.getPhotoUploadUrl({
          contentType: file.type as PhotoContentType,
        })
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        })
        return key
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [dispatch]
  )

  const analyze = useCallback(
    async (key: string): Promise<PhotoAnalyzeResponse> => {
      try {
        setIsAnalyzing(true)
        return await pantryService.analyzePhoto(key)
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
        throw err
      } finally {
        setIsAnalyzing(false)
      }
    },
    [dispatch]
  )

  return { upload, analyze, isUploading, isAnalyzing, error }
}
