import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import profileService from '@/services/profile.service'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setToken, setUser } from '@store/slices/auth.slice'
import { ONBOARDING_STORAGE_KEY } from '@components/pages/HowItWorksCarousel/HowItWorksCarousel'

/**
 * Shared post-authentication sequence used by both password login and Google SSO:
 * store the token, load the profile, then route by role / onboarding state.
 */
export const useCompleteLogin = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useCallback(
    async (accessToken: string) => {
      // setToken writes to localStorage synchronously, so the api-client picks it up
      // for the immediate profile request below.
      dispatch(setToken(accessToken))
      const profile = await profileService.getProfile()
      dispatch(setUser(profile))

      if (profile.role === 'admin') {
        navigate('/admin')
      } else if (localStorage.getItem(ONBOARDING_STORAGE_KEY)) {
        navigate('/staples')
      } else {
        navigate('/how-it-works')
      }
    },
    [dispatch, navigate]
  )
}
