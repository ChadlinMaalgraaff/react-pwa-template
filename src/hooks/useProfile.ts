import { useState, useEffect, useCallback } from 'react'
import profileService from '@/services/profile.service'
import { UserProfile, UpdateProfileRequest } from '@/types/profile.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { setUser } from '@store/slices/auth.slice'
import { getErrorMessage } from '@utils/helpers'

export const useProfile = () => {
  const dispatch = useAppDispatch()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await profileService.getProfile()
        setProfile(data)
        dispatch(setUser(data))
      } catch (err) {
        const message = getErrorMessage(err)
        setError(message)
        dispatch(setNotification({ message, type: 'error' }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [dispatch])

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      try {
        setIsLoading(true)
        const updated = await profileService.updateProfile(data)
        setProfile(updated)
        dispatch(setUser(updated))
        return updated
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

  return { profile, isLoading, error, updateProfile }
}
