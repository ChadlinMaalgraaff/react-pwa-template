import { Card, Badge } from '@components/shared'
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
  matchInfo?: RecipeCardMatchInfo
  onClick?: () => void
}

const RecipeCard = ({
  title,
  imageUrl,
  cuisine,
  prepTimeMinutes,
  cookTimeMinutes,
  servings,
  matchInfo,
  onClick,
}: RecipeCardProps) => {
  const totalTime = (prepTimeMinutes ?? 0) + (cookTimeMinutes ?? 0)

  const content = (
    <Card className="recipe-card">
      {imageUrl && <img src={imageUrl} alt={title} className="recipe-card-image" />}
      <h3 className="recipe-card-title">{title}</h3>
      <div className="recipe-card-meta">
        {cuisine && <span>{cuisine}</span>}
        {totalTime > 0 && <span>{totalTime} min</span>}
        {servings && <span>{servings} servings</span>}
      </div>
      {matchInfo && (
        <Badge variant={matchInfo.isFullyMakeable ? 'success' : 'accent'}>
          {matchInfo.isFullyMakeable ? 'Makeable' : `Missing ${matchInfo.missingCount}`}
        </Badge>
      )}
    </Card>
  )

  if (!onClick) {
    return content
  }

  return (
    <button type="button" onClick={onClick} className="recipe-card-button">
      {content}
    </button>
  )
}

export default RecipeCard
