import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RecipeIngredientRow from '@components/recipes/RecipeIngredientRow/RecipeIngredientRow'
import { RecipeIngredientDetail } from '@/types/recipes.types'

const inPantryIngredient: RecipeIngredientDetail = {
  ingredientId: 'ing-1',
  name: 'Rice',
  quantity: 2,
  unit: 'cups',
  isOptional: false,
  notes: null,
  inPantry: true,
}

const missingIngredient: RecipeIngredientDetail = {
  ingredientId: 'ing-2',
  name: 'Saffron',
  quantity: 1,
  unit: 'pinch',
  isOptional: true,
  notes: null,
  inPantry: false,
}

describe('RecipeIngredientRow Component', () => {
  it('renders the ingredient name and quantity', () => {
    render(<RecipeIngredientRow ingredient={inPantryIngredient} />)
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByText('2 cups')).toBeInTheDocument()
  })

  it('shows an "in pantry" indicator when inPantry is true', () => {
    render(<RecipeIngredientRow ingredient={inPantryIngredient} />)
    expect(screen.getByLabelText('In pantry')).toBeInTheDocument()
    expect(screen.queryByLabelText('Missing')).not.toBeInTheDocument()
  })

  it('shows a "missing" indicator and optional tag when not in pantry', () => {
    render(<RecipeIngredientRow ingredient={missingIngredient} />)
    expect(screen.getByLabelText('Missing')).toBeInTheDocument()
    expect(screen.getByText('Optional')).toBeInTheDocument()
  })
})
