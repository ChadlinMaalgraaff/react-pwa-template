import { useNavigate } from 'react-router-dom'
import { Tabs, EmptyState, Spinner, type TabOption } from '@components/shared'
import { RecipeCard } from '@components/recipes'
import { useRecipeMatch } from '@hooks/useRecipeMatch'
import './RecipeMatch.css'

const RECIPE_TABS: TabOption[] = [
  { value: 'match', label: 'Cook Now' },
  { value: 'browse', label: 'Browse' },
]

const RecipeMatch = () => {
  const navigate = useNavigate()
  const { matches, isLoading } = useRecipeMatch({ maxMissing: 2 })

  const handleTabChange = (value: string) => {
    if (value === 'browse') navigate('/recipes/browse')
  }

  const sortedMatches = [...matches].sort((a, b) => Number(b.isFullyMakeable) - Number(a.isFullyMakeable))

  return (
    <div className="recipe-match-page">
      <Tabs tabs={RECIPE_TABS} value="match" onChange={handleTabChange} />

      {isLoading ? (
        <Spinner fullScreen />
      ) : sortedMatches.length === 0 ? (
        <EmptyState
          title="Add items to your pantry to see recipe matches"
          actionLabel="Go to Pantry"
          onAction={() => navigate('/pantry')}
        />
      ) : (
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
      )}
    </div>
  )
}

export default RecipeMatch
