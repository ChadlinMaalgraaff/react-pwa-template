import { Check, X } from 'lucide-react'
import { RecipeIngredientDetail } from '@/types/recipes.types'
import './RecipeIngredientRow.css'

interface RecipeIngredientRowProps {
  ingredient: RecipeIngredientDetail
}

const RecipeIngredientRow = ({ ingredient }: RecipeIngredientRowProps) => (
  <div className="recipe-ingredient-row">
    <div className="recipe-ingredient-info">
      <span className="recipe-ingredient-name">{ingredient.name}</span>
      <span className="recipe-ingredient-quantity">
        {ingredient.quantity} {ingredient.unit}
      </span>
      {ingredient.isOptional && <span className="recipe-ingredient-optional">Optional</span>}
    </div>
    {ingredient.inPantry ? (
      <Check className="h-5 w-5 text-primary" aria-label="In pantry" />
    ) : (
      <X className="h-5 w-5 text-danger" aria-label="Missing" />
    )}
  </div>
)

export default RecipeIngredientRow
