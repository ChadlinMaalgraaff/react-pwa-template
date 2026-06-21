import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button, Chip, Spinner } from '@components/shared'
import { useProfile } from '@hooks/useProfile'
import { useAppDispatch } from '@hooks/redux.hooks'
import { logout } from '@store/slices/auth.slice'
import { setNotification } from '@store/slices/ui.slice'
import { DIETARY_PREFERENCE_OPTIONS } from '@utils/dietaryOptions'
import './Profile.css'

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

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
      <div className="profile-user-info">
        <span className="profile-avatar">{initials(profile.name)}</span>
        <div>
          <strong className="profile-name">{profile.name}</strong>
          <p className="profile-email">{profile.email}</p>
        </div>
      </div>

      <div className="profile-prefs-card">
        <p className="profile-section-title">Dietary preferences</p>
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
        <LogOut className="h-[18px] w-[18px]" />
        Log out
      </Button>
    </div>
  )
}

export default Profile
