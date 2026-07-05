import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, SlidersHorizontal } from 'lucide-react'
import { Tabs, Button, Chip, SearchBar, BottomSheet, Spinner, type TabOption } from '@components/shared'
import { RecipeCard } from '@components/recipes'
import { useRecipeMatch } from '@hooks/useRecipeMatch'
import { MEAL_TYPES, MEAL_TYPE_LABELS, MealType, MatchedRecipe } from '@/types/recipes.types'
import {
  NutritionSort,
  NUTRITION_COMPARATORS,
  NUTRITION_SORT_LABELS,
  seededShuffle,
  getSessionShuffleSeed,
} from '@utils/recipeSort'
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
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: 'Any', value: undefined },
]

// Every sort is computed instantly from data already on each match — no AI involved.
// 'best' is match-specific; the nutrition sorts and shuffle are shared with Browse.
type SortMode = 'best' | NutritionSort | 'shuffle'

type SortOption = { value: SortMode; label: string }

const SORT_OPTIONS: SortOption[] = [
  { value: 'best', label: 'Best match' },
  { value: 'protein', label: NUTRITION_SORT_LABELS.protein },
  { value: 'light', label: NUTRITION_SORT_LABELS.light },
  { value: 'low-carb', label: NUTRITION_SORT_LABELS['low-carb'] },
  { value: 'low-fat', label: NUTRITION_SORT_LABELS['low-fat'] },
  { value: 'filling', label: NUTRITION_SORT_LABELS.filling },
  { value: 'shuffle', label: 'Surprise me' },
]

// Fully-makeable recipes first, then fewest missing ingredients. Stable for equal items,
// so the order is deterministic across remounts.
const byMatchQuality = (a: MatchedRecipe, b: MatchedRecipe): number => {
  if (a.isFullyMakeable !== b.isFullyMakeable) return a.isFullyMakeable ? -1 : 1
  return a.missingIngredients.length - b.missingIngredients.length
}

const SHUFFLE_SEED_KEY = 'recipeMatchShuffleSeed'
const FILTERS_KEY = 'recipeMatchFilters'

interface PersistedFilters {
  maxMissing: number | undefined
  mealType: MealType | null
  sortMode: SortMode
}

const DEFAULT_FILTERS: PersistedFilters = { maxMissing: 2, mealType: null, sortMode: 'best' }

const isSortMode = (value: unknown): value is SortMode =>
  SORT_OPTIONS.some((option) => option.value === value)

// Filters persist for the browser session so they survive navigating into a recipe and back.
const loadFilters = (): PersistedFilters => {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed = JSON.parse(raw) as Partial<PersistedFilters>
    return {
      maxMissing: typeof parsed.maxMissing === 'number' ? parsed.maxMissing : undefined,
      mealType: parsed.mealType && MEAL_TYPES.includes(parsed.mealType) ? parsed.mealType : null,
      sortMode: isSortMode(parsed.sortMode) ? parsed.sortMode : 'best',
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

const RecipeMatch = () => {
  const navigate = useNavigate()
  // Lazy init reads sessionStorage on every mount (not once at module load), so filters saved
  // before navigating into a recipe are restored when this screen remounts.
  const [initialFilters] = useState(loadFilters)
  const [maxMissing, setMaxMissing] = useState<number | undefined>(initialFilters.maxMissing)
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | null>(initialFilters.mealType)
  const [sortMode, setSortMode] = useState<SortMode>(initialFilters.sortMode)
  const [search, setSearch] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { matches, isLoading } = useRecipeMatch({ maxMissing, pageSize: 3000 })

  // Count of filters set away from their defaults, surfaced as a badge on the filter button.
  const activeFilterCount =
    (maxMissing !== DEFAULT_FILTERS.maxMissing ? 1 : 0) +
    (mealTypeFilter !== null ? 1 : 0) +
    (sortMode !== DEFAULT_FILTERS.sortMode ? 1 : 0)

  const resetFilters = () => {
    setMaxMissing(DEFAULT_FILTERS.maxMissing)
    setMealTypeFilter(DEFAULT_FILTERS.mealType)
    setSortMode(DEFAULT_FILTERS.sortMode)
  }

  const handleTabChange = (value: string) => {
    if (value === 'browse') navigate('/recipes/browse')
  }

  // Persist filters so they survive navigating into a recipe and back.
  useEffect(() => {
    const toStore: PersistedFilters = { maxMissing, mealType: mealTypeFilter, sortMode }
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(toStore))
  }, [maxMissing, mealTypeFilter, sortMode])

  // Seed is read once per mount from sessionStorage, so the "Surprise me" order is preserved
  // when navigating to a recipe and back instead of reshuffling.
  const [shuffleSeed] = useState(() => getSessionShuffleSeed(SHUFFLE_SEED_KEY))

  // Search + meal-type narrowing, before any ordering is applied.
  const searchedMatches = useMemo(() => {
    const query = search.trim().toLowerCase()
    return matches.filter(
      (match) =>
        (mealTypeFilter === null || match.mealTypes?.includes(mealTypeFilter)) &&
        (query === '' || match.title.toLowerCase().includes(query))
    )
  }, [matches, mealTypeFilter, search])

  const displayedMatches = useMemo(() => {
    if (sortMode === 'shuffle') return seededShuffle(searchedMatches, shuffleSeed)
    if (sortMode === 'best') return [...searchedMatches].sort(byMatchQuality)
    return [...searchedMatches].sort(NUTRITION_COMPARATORS[sortMode])
  }, [searchedMatches, sortMode, shuffleSeed])

  return (
    <div className="recipe-match-page">
      <Tabs tabs={RECIPE_TABS} value="match" onChange={handleTabChange} />

      <SearchBar
        placeholder="Search recipes you can cook..."
        onSearch={setSearch}
        filterAction={
          <button
            type="button"
            aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            onClick={() => setIsFilterOpen(true)}
            className="recipe-match-filter-btn"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {activeFilterCount > 0 && (
              <span className="recipe-match-filter-btn-badge">{activeFilterCount}</span>
            )}
          </button>
        }
      />

      {isLoading ? (
        <Spinner fullScreen />
      ) : matches.length === 0 ? (
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
      ) : searchedMatches.length === 0 ? (
        <p className="recipe-match-nudge">
          {search.trim()
            ? `No recipes match "${search.trim()}". Try a different search or filter.`
            : 'No recipes for this meal type. Try another or pick "All".'}
        </p>
      ) : (
        <>
          <p className="recipe-match-count">
            {displayedMatches.length} recipe{displayedMatches.length === 1 ? '' : 's'} you can cook
          </p>

          {displayedMatches.length < 3 && maxMissing !== undefined && (
            <p className="recipe-match-nudge">Try &quot;Any&quot; to see more recipes.</p>
          )}

          <div className="recipe-match-list">
            {displayedMatches.map((match) => (
              <RecipeCard
                key={match.id}
                title={match.title}
                imageUrl={match.imageUrl}
                calories={match.calories}
                protein={match.protein}
                matchInfo={{
                  isFullyMakeable: match.isFullyMakeable,
                  missingCount: match.missingIngredients.length,
                }}
                onClick={() => navigate(`/recipes/${match.id}`)}
              />
            ))}
          </div>
        </>
      )}

      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filters">
        <div className="recipe-match-filter-groups">
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

          <div className="recipe-match-filter">
            <span className="recipe-match-filter-label">Meal type</span>
            <div className="recipe-match-filter-chips">
              <Chip selected={mealTypeFilter === null} onClick={() => setMealTypeFilter(null)}>
                All
              </Chip>
              {MEAL_TYPES.map((mealType) => (
                <Chip
                  key={mealType}
                  selected={mealTypeFilter === mealType}
                  onClick={() => setMealTypeFilter((prev) => (prev === mealType ? null : mealType))}
                >
                  {MEAL_TYPE_LABELS[mealType]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="recipe-match-filter">
            <span className="recipe-match-filter-label">Sort by</span>
            <div className="recipe-match-filter-chips">
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  selected={sortMode === option.value}
                  onClick={() => setSortMode(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="recipe-match-filter-actions">
            {activeFilterCount > 0 && (
              <Button variant="secondary" onClick={resetFilters}>
                Reset
              </Button>
            )}
            <Button onClick={() => setIsFilterOpen(false)}>Done</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default RecipeMatch
