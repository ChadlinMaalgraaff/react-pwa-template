import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, EmptyState, ProgressSteps } from '@components/shared'
import { SuggestionReviewRow, IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { usePantry } from '@hooks/usePantry'
import { useAppDispatch } from '@hooks/redux.hooks'
import { setNotification } from '@store/slices/ui.slice'
import { PantrySuggestion } from '@/types/pantry.types'
import './PhotoReview.css'

const STEPS = ['Capture', 'Review']

interface PhotoReviewLocationState {
  suggestions?: PantrySuggestion[]
}

const PhotoReview = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { addItem } = usePantry()
  const rawSuggestions = (location.state as PhotoReviewLocationState | null)?.suggestions ?? []
  const [suggestions, setSuggestions] = useState<PantrySuggestion[]>(
    [...rawSuggestions].sort((a, b) => b.confidence - a.confidence)
  )
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (index: number, suggestion: PantrySuggestion) => {
    setSuggestions((prev) => prev.map((item, i) => (i === index ? suggestion : item)))
  }

  const handleRemove = (index: number) => {
    setSuggestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleManualAdd = (selection: IngredientSelection) => {
    const newSuggestion: PantrySuggestion =
      'id' in selection
        ? { ingredientId: selection.id, name: selection.name, matchedExisting: true, quantity: 1, unit: selection.defaultUnit, confidence: 1 }
        : { ingredientId: null, name: selection.ingredientName, matchedExisting: false, quantity: 1, unit: '', confidence: 1 }
    setSuggestions((prev) => [...prev, newSuggestion])
  }

  const lowConfidenceCount = suggestions.filter((s) => s.confidence < 0.5).length

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await Promise.all(
        suggestions.map((suggestion) =>
          addItem(
            suggestion.matchedExisting && suggestion.ingredientId
              ? { ingredientId: suggestion.ingredientId, quantity: suggestion.quantity, unit: suggestion.unit }
              : { ingredientName: suggestion.name, quantity: suggestion.quantity, unit: suggestion.unit }
          )
        )
      )
      dispatch(setNotification({ message: `${suggestions.length} items added to your pantry`, type: 'success' }))
      navigate('/pantry')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="photo-review-page">
      <ProgressSteps steps={STEPS} currentStep={2} className="photo-review-progress" />

      {suggestions.length === 0 ? (
        <EmptyState
          title="We couldn't identify any items"
          message="Try a clearer photo or add manually."
        />
      ) : (
        <div className="photo-review-list">
          {suggestions.map((suggestion, index) => (
            <SuggestionReviewRow
              key={`${suggestion.name}-${index}`}
              suggestion={suggestion}
              onChange={(value) => handleChange(index, value)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}

      <div className="photo-review-manual">
        <IngredientAutocomplete onSelect={handleManualAdd} placeholder="Add item manually..." />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={suggestions.length === 0}
        isLoading={isSaving}
        className="w-full"
      >
        {lowConfidenceCount > 0
          ? `Add ${suggestions.length} items to pantry (${lowConfidenceCount} to review)`
          : `Add ${suggestions.length} items to pantry`}
      </Button>
    </div>
  )
}

export default PhotoReview
