import { Check, Plus } from 'lucide-react'
import { RecipeIngredientDetail } from '@/types/recipes.types'
import './RecipeIngredientRow.css'

interface RecipeIngredientRowProps {
  ingredient: RecipeIngredientDetail
}

const RecipeIngredientRow = ({ ingredient }: RecipeIngredientRowProps) => (
  <div className={`recipe-ingredient-row ${ingredient.inPantry ? 'recipe-ingredient-row--have' : 'recipe-ingredient-row--miss'}`}>
    <span className={`recipe-ingredient-ico ${ingredient.inPantry ? 'recipe-ingredient-ico--have' : 'recipe-ingredient-ico--miss'}`}>
      {ingredient.inPantry
        ? <Check className="h-3.5 w-3.5" aria-label="In pantry" />
        : <Plus className="h-3.5 w-3.5" aria-label="Missing" />}
    </span>
    <span className="recipe-ingredient-name">
      {ingredient.name}
      {ingredient.isOptional && <span className="recipe-ingredient-optional">Optional</span>}
    </span>
    <span className="recipe-ingredient-amt">{ingredient.quantity} {ingredient.unit}</span>
  </div>
)

export default RecipeIngredientRow
