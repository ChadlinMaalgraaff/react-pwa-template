import { useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@components/shared'
import { IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import './RecipeIngredientFormRow.css'

export interface RecipeIngredientFormValue {
  ingredientId?: string
  ingredientName: string
  quantity: number
  unit: string
  isOptional: boolean
  notes: string
}

interface RecipeIngredientFormRowProps {
  value: RecipeIngredientFormValue
  onChange: (value: RecipeIngredientFormValue) => void
  onRemove: () => void
}

const RecipeIngredientFormRow = ({ value, onChange, onRemove }: RecipeIngredientFormRowProps) => {
  const [isEditingIngredient, setIsEditingIngredient] = useState(!value.ingredientName)

  const handleSelect = (selection: IngredientSelection) => {
    if ('id' in selection) {
      onChange({
        ...value,
        ingredientId: selection.id,
        ingredientName: selection.name,
        unit: value.unit || selection.defaultUnit,
      })
    } else {
      onChange({ ...value, ingredientId: undefined, ingredientName: selection.ingredientName })
    }
    setIsEditingIngredient(false)
  }

  return (
    <div className="recipe-ingredient-form-row">
      <div className="recipe-ingredient-form-name">
        {isEditingIngredient ? (
          <IngredientAutocomplete onSelect={handleSelect} placeholder="Search ingredients..." />
        ) : (
          <div className="recipe-ingredient-form-name-display">
            <span>{value.ingredientName}</span>
            <button type="button" onClick={() => setIsEditingIngredient(true)}>
              Change
            </button>
          </div>
        )}
      </div>
      <Input
        type="number"
        aria-label="Quantity"
        value={value.quantity}
        onChange={(event) => onChange({ ...value, quantity: Number(event.target.value) })}
        className="recipe-ingredient-form-quantity"
      />
      <Input
        type="text"
        aria-label="Unit"
        value={value.unit}
        onChange={(event) => onChange({ ...value, unit: event.target.value })}
        className="recipe-ingredient-form-unit"
      />
      <label className="recipe-ingredient-form-optional">
        <input
          type="checkbox"
          checked={value.isOptional}
          onChange={(event) => onChange({ ...value, isOptional: event.target.checked })}
        />
        Optional
      </label>
      <Input
        type="text"
        aria-label="Notes"
        value={value.notes}
        onChange={(event) => onChange({ ...value, notes: event.target.value })}
        className="recipe-ingredient-form-notes"
      />
      <button type="button" aria-label="Remove ingredient" onClick={onRemove}>
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

export default RecipeIngredientFormRow
