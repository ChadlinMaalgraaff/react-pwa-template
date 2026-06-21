import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, X } from 'lucide-react'
import { Tabs, Button, Chip, Spinner, type TabOption } from '@components/shared'
import { RecipeCard } from '@components/recipes'
import { useRecipeMatch } from '@hooks/useRecipeMatch'
import { useRecipeRecommendation } from '@hooks/useRecipeRecommendation'
import { RecommendGoal } from '@/types/recipes.types'
import './RecipeMatch.css'

const RECIPE_TABS: TabOption[] = [
  { value: 'match', label: 'Cook now' },
  { value: 'browse', label: 'Browse' },
]

type MaxMissingOption = { label: string; value: number | undefined }

const MAX_MISSING_OPTIONS: MaxMissingOption[] = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '5', value: 5 },
  { label: 'Any', value: undefined },
]

type GoalOption = { value: RecommendGoal; label: string }

const GOAL_OPTIONS: GoalOption[] = [
  { value: 'cost-effective', label: 'Cost-effective' },
  { value: 'high-protein', label: 'High protein' },
  { value: 'light-meal', label: 'Light meal' },
  { value: 'quick-cook', label: 'Quick cook' },
]

const RecipeMatch = () => {
  const navigate = useNavigate()
  const [maxMissing, setMaxMissing] = useState<number | undefined>(2)
  const [selectedGoal, setSelectedGoal] = useState<RecommendGoal | null>(null)
  const { matches, isLoading } = useRecipeMatch({ maxMissing })
  const { recommendation, isLoading: isRecommending, recommend, clear } = useRecipeRecommendation()

  const handleTabChange = (value: string) => {
    if (value === 'browse') navigate('/recipes/browse')
  }

  const sortedMatches = [...matches].sort((a, b) => Number(b.isFullyMakeable) - Number(a.isFullyMakeable))

  useEffect(() => {
    if (selectedGoal !== null) {
      clear()
      setSelectedGoal(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxMissing])

  const handleGoalSelect = (goal: RecommendGoal) => {
    if (selectedGoal === goal) {
      clear()
      setSelectedGoal(null)
      return
    }
    setSelectedGoal(goal)
    recommend(goal, sortedMatches)
  }

  const handleDismiss = () => {
    clear()
    setSelectedGoal(null)
  }

  const recommendedRecipe = recommendation
    ? sortedMatches.find((m) => m.id === recommendation.recommendedRecipeId)
    : null

  return (
    <div className="recipe-match-page">
      <Tabs tabs={RECIPE_TABS} value="match" onChange={handleTabChange} />

      <div className="recipe-match-filter">
        <span className="recipe-match-filter-label">
          {maxMissing === undefined
            ? 'Recipes with any number of missing ingredients'
            : `Recipes with up to ${maxMissing} missing ingredient${maxMissing === 1 ? '' : 's'}`}
        </span>
        <div className="recipe-match-filter-chips">
          {MAX_MISSING_OPTIONS.map((option) => (
            <Chip
              key={option.label}
              selected={maxMissing === option.value}
              onClick={() => setMaxMissing(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Spinner fullScreen />
      ) : sortedMatches.length === 0 ? (
        <div className="recipe-match-empty">
          <p className="recipe-match-empty-title">No recipes found yet</p>
          <p className="recipe-match-empty-message">
            Snap a photo of your pantry and we&apos;ll find recipes you can make right now.
          </p>
          <div className="recipe-match-empty-actions">
            <Button onClick={() => navigate('/pantry/capture')}>
              <Camera className="h-[18px] w-[18px]" />
              Scan Your Pantry
            </Button>
            <Button variant="secondary" onClick={() => navigate('/pantry')}>
              Add Items Manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="recipe-match-goal-section">
            <span className="recipe-match-goal-label">What&apos;s your goal today?</span>
            <div className="recipe-match-filter-chips">
              {GOAL_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={selectedGoal === option.value}
                  onClick={() => handleGoalSelect(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          {isRecommending && (
            <div className="recipe-match-skeleton" aria-label="Loading recommendation">
              <div className="recipe-match-skeleton-line recipe-match-skeleton-line--short" />
              <div className="recipe-match-skeleton-line" />
              <div className="recipe-match-skeleton-line recipe-match-skeleton-line--medium" />
            </div>
          )}

          {!isRecommending && recommendation && recommendedRecipe && (
            <div className="recipe-match-recommendation">
              <span className="recipe-match-recommendation-glow" />
              <div className="recipe-match-recommendation-header">
                <span className="recipe-match-recommendation-eyebrow">
                  <Sparkles className="h-3 w-3" />
                  Today&apos;s pick
                </span>
                <button
                  type="button"
                  aria-label="Dismiss recommendation"
                  onClick={handleDismiss}
                  className="recipe-match-recommendation-dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="recipe-match-recommendation-title">{recommendedRecipe.title}</p>
              <p className="recipe-match-recommendation-rationale">{recommendation.rationale}</p>
              <button
                type="button"
                className="recipe-match-recommendation-btn"
                onClick={() => navigate(`/recipes/${recommendation.recommendedRecipeId}`)}
              >
                View Recipe →
              </button>
            </div>
          )}

          {sortedMatches.length < 3 && maxMissing !== undefined && (
            <p className="recipe-match-nudge">
              Try &quot;Any&quot; to see more recipes.
            </p>
          )}

          <div className="recipe-match-list">
            {sortedMatches.map((match) => (
              <RecipeCard
                key={match.id}
                title={match.title}
                imageUrl={match.imageUrl}
                matchInfo={{ isFullyMakeable: match.isFullyMakeable, missingCount: match.missingIngredients.length }}
                onClick={() => navigate(`/recipes/${match.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default RecipeMatch
