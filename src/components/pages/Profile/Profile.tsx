import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Spinner } from '@components/shared'
import { useProfile } from '@hooks/useProfile'
import { useAppDispatch } from '@hooks/redux.hooks'
import { logout } from '@store/slices/auth.slice'
import { setNotification } from '@store/slices/ui.slice'
import { DIETARY_PREFERENCE_OPTIONS } from '@utils/dietaryOptions'
import './Profile.css'

const Profile = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { profile, isLoading, updateProfile } = useProfile()
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setDietaryPreferences(profile.dietaryPreferences)
    }
  }, [profile])

  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(preference) ? prev.filter((item) => item !== preference) : [...prev, preference]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ dietaryPreferences })
      dispatch(setNotification({ message: 'Profile updated', type: 'success' }))
    } catch {
      // error notification already dispatched by useProfile
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  if (isLoading || !profile) {
    return <Spinner fullScreen />
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <p className="profile-name">{profile.name}</p>
        <p className="profile-email">{profile.email}</p>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Dietary preferences</h2>
        <div className="profile-chip-group">
          {DIETARY_PREFERENCE_OPTIONS.map((option) => (
            <Chip
              key={option}
              selected={dietaryPreferences.includes(option)}
              onClick={() => toggleDietaryPreference(option)}
            >
              {option}
            </Chip>
          ))}
        </div>
      </div>

      <Button type="button" onClick={handleSave} isLoading={isSaving} className="w-full">
        Save changes
      </Button>

      <hr className="profile-divider" />

      <Button type="button" variant="secondary" onClick={handleLogout} className="w-full">
        Log out
      </Button>
    </div>
  )
}

export default Profile
