import { UtensilsCrossed } from 'lucide-react'
import { Badge } from '@components/shared'
import './RecipeCard.css'

export interface RecipeCardMatchInfo {
  isFullyMakeable: boolean
  missingCount: number
}

interface RecipeCardProps {
  title: string
  imageUrl: string | null
  cuisine?: string | null
  prepTimeMinutes?: number | null
  cookTimeMinutes?: number | null
  servings?: number | null
  /** AI-estimated kcal per serving — omitted/null for un-enriched recipes. */
  calories?: number | null
  /** AI-estimated grams of protein per serving — omitted/null for un-enriched recipes. */
  protein?: number | null
  matchInfo?: RecipeCardMatchInfo
  onClick?: () => void
}

// Nutrition values are AI estimates, so always prefix with "Est." per the recipe-enrichment PRD.
const formatEstimatedNutrition = (calories?: number | null, protein?: number | null): string | null => {
  const parts: string[] = []
  if (typeof calories === 'number') parts.push(`${Math.round(calories)} kcal`)
  if (typeof protein === 'number') parts.push(`${Math.round(protein)}g protein`)
  return parts.length > 0 ? `Est. ${parts.join(' · ')}` : null
}

const RecipeCard = ({
  title,
  imageUrl,
  cuisine,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  calories,
  protein,
  matchInfo,
  onClick,
}: RecipeCardProps) => {
  const totalTime = (prepTimeMinutes ?? 0) + (cookTimeMinutes ?? 0)
  const nutrition = formatEstimatedNutrition(calories, protein)

  const content = (
    <div className="recipe-card">
      <div className="recipe-card-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="recipe-card-image" />
        ) : (
          <UtensilsCrossed className="recipe-card-image-placeholder" strokeWidth={1.2} />
        )}
        {matchInfo && (
          <span className="recipe-card-ribbon">
            <Badge variant={matchInfo.isFullyMakeable ? 'success' : 'accent'}>
              {matchInfo.isFullyMakeable ? 'Makeable' : `Pantry is missing ${matchInfo.missingCount} ingredients for this recipe`}
            </Badge>
          </span>
        )}
      </div>
      <div className="recipe-card-body">
        <h3 className="recipe-card-title">{title}</h3>
        <div className="recipe-card-meta">
          {cuisine && <span>{cuisine}</span>}
          {cuisine && totalTime > 0 && <span className="recipe-card-meta-dot" />}
          {totalTime > 0 && <span>{totalTime} min</span>}
          {servings && totalTime > 0 && <span className="recipe-card-meta-dot" />}
          {servings && <span>{servings} servings</span>}
        </div>
        {nutrition && <p className="recipe-card-nutrition">{nutrition}</p>}
      </div>
    </div>
  )

  if (!onClick) return content

  return (
    <button type="button" onClick={onClick} className="recipe-card-button">
      {content}
    </button>
  )
}

export default RecipeCard
