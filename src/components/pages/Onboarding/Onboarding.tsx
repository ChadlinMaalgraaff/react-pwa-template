import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Input, ProgressSteps } from '@components/shared'
import profileService from '@/services/profile.service'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { getErrorMessage } from '@utils/helpers'
import { DIETARY_PREFERENCE_OPTIONS } from '@utils/dietaryOptions'
import './Onboarding.css'

const STEPS = ['Shopping area', 'Dietary preferences']

const Onboarding = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [preferredArea, setPreferredArea] = useState('')
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleDietaryPreference = (preference: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(preference) ? prev.filter((item) => item !== preference) : [...prev, preference]
    )
  }

  const finish = async (payload: { preferredArea?: string; dietaryPreferences?: string[] }) => {
    setIsLoading(true)
    try {
      await profileService.updateProfile(payload)
      navigate('/pantry')
    } catch (err) {
      dispatch(setNotification({ message: getErrorMessage(err), type: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => finish({})

  const handleDone = () => finish({ preferredArea, dietaryPreferences })

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <ProgressSteps steps={STEPS} currentStep={step} className="onboarding-progress" />
        {step === 1 ? (
          <>
            <h2 className="onboarding-heading">Where do you usually shop?</h2>
            <Input
              label="Suburb"
              placeholder="e.g. Sandton"
              value={preferredArea}
              onChange={(event) => setPreferredArea(event.target.value)}
            />
            <div className="onboarding-actions">
              <button type="button" className="onboarding-skip" onClick={handleSkip}>
                Skip
              </button>
              <Button type="button" onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="onboarding-heading">Any dietary preferences?</h2>
            <div className="onboarding-chip-group">
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
            <div className="onboarding-actions">
              <button type="button" className="onboarding-skip" onClick={handleSkip}>
                Skip
              </button>
              <Button type="button" onClick={handleDone} isLoading={isLoading}>
                Done
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Onboarding
