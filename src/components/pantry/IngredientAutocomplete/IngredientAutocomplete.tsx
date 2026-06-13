import { useState } from 'react'
import { SearchBar } from '@components/shared'
import { useIngredients } from '@hooks/useIngredients'
import { Ingredient } from '@/types/ingredients.types'
import './IngredientAutocomplete.css'

export interface NewIngredientOption {
  ingredientName: string
}

export type IngredientSelection = Ingredient | NewIngredientOption

interface IngredientAutocompleteProps {
  onSelect: (selection: IngredientSelection) => void
  placeholder?: string
}

const IngredientAutocomplete = ({
  onSelect,
  placeholder = 'Search ingredients...',
}: IngredientAutocompleteProps) => {
  const [term, setTerm] = useState('')
  const { ingredients, setParams } = useIngredients()

  const handleSearch = (value: string) => {
    setTerm(value)
    setParams(value ? { search: value } : {})
  }

  const handleSelect = (selection: IngredientSelection) => {
    onSelect(selection)
    setTerm('')
    setParams({})
  }

  const trimmedTerm = term.trim()
  const hasExactMatch = ingredients.some(
    (ingredient) => ingredient.name.toLowerCase() === trimmedTerm.toLowerCase()
  )

  return (
    <div className="ingredient-autocomplete">
      <SearchBar onSearch={handleSearch} placeholder={placeholder} />
      {trimmedTerm && (
        <ul className="ingredient-autocomplete-list">
          {ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              <button
                type="button"
                className="ingredient-autocomplete-option"
                onClick={() => handleSelect(ingredient)}
              >
                {ingredient.name}
              </button>
            </li>
          ))}
          {!hasExactMatch && (
            <li>
              <button
                type="button"
                className="ingredient-autocomplete-option"
                onClick={() => handleSelect({ ingredientName: trimmedTerm })}
              >
                Add &quot;{trimmedTerm}&quot; as new ingredient
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export default IngredientAutocomplete
