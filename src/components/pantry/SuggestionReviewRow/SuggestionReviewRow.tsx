import { X } from 'lucide-react'
import { PantrySuggestion } from '@/types/pantry.types'
import { QuantityStepper, Badge } from '@components/shared'
import '@styles/shared.css'
import './SuggestionReviewRow.css'

const LOW_CONFIDENCE_THRESHOLD = 0.5

interface SuggestionReviewRowProps {
  suggestion: PantrySuggestion
  onChange: (suggestion: PantrySuggestion) => void
  onRemove: () => void
}

const SuggestionReviewRow = ({ suggestion, onChange, onRemove }: SuggestionReviewRowProps) => {
  const isLowConfidence = suggestion.confidence < LOW_CONFIDENCE_THRESHOLD

  return (
    <div className="suggestion-review-row">
      <div className="suggestion-review-info">
        {suggestion.matchedExisting ? (
          <p className="suggestion-review-name">{suggestion.name}</p>
        ) : (
          <input
            type="text"
            value={suggestion.name}
            onChange={(event) => onChange({ ...suggestion, name: event.target.value })}
            className="input-base"
            aria-label="Ingredient name"
          />
        )}
        {isLowConfidence && <Badge variant="accent">Low confidence</Badge>}
      </div>
      <QuantityStepper
        value={suggestion.quantity}
        unit={suggestion.unit}
        onChange={(quantity) => onChange({ ...suggestion, quantity })}
      />
      <button
        type="button"
        aria-label="Remove suggestion"
        onClick={onRemove}
        className="suggestion-review-remove"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

export default SuggestionReviewRow
