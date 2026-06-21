import { AlertCircle, X } from 'lucide-react'
import { PantrySuggestion } from '@/types/pantry.types'
import { QuantityStepper } from '@components/shared'
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
    <div className={`suggestion-review-row${isLowConfidence ? ' suggestion-review-row--low-confidence' : ''}`}>
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
        {isLowConfidence && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#9A6510]">
            <AlertCircle className="h-3 w-3" />
            Not sure — please check
          </span>
        )}
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
