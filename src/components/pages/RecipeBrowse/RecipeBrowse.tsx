import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { Tabs, SearchBar, Chip, Button, BottomSheet, EmptyState, Spinner, type TabOption } from '@components/shared'
import { RecipeCard } from '@components/recipes'
import { useRecipes } from '@hooks/useRecipes'
import { MEAL_TYPES, MEAL_TYPE_LABELS, MealType } from '@/types/recipes.types'
import {
  NutritionSort,
  NUTRITION_COMPARATORS,
  NUTRITION_SORT_LABELS,
  seededShuffle,
  getSessionShuffleSeed,
} from '@utils/recipeSort'
import './RecipeBrowse.css'

const RECIPE_TABS: TabOption[] = [
  { value: 'match', label: 'Cook Now' },
  { value: 'browse', label: 'Browse' },
]

// 'default' keeps the catalogue order; the nutrition sorts and shuffle are shared with Cook Now.
type SortMode = 'default' | NutritionSort | 'shuffle'

type SortOption = { value: SortMode; label: string }

const SORT_OPTIONS: SortOption[] = [
  { value: 'default', label: 'Default' },
  { value: 'protein', label: NUTRITION_SORT_LABELS.protein },
  { value: 'light', label: NUTRITION_SORT_LABELS.light },
  { value: 'low-carb', label: NUTRITION_SORT_LABELS['low-carb'] },
  { value: 'low-fat', label: NUTRITION_SORT_LABELS['low-fat'] },
  { value: 'filling', label: NUTRITION_SORT_LABELS.filling },
  { value: 'shuffle', label: 'Surprise me' },
]

const SHUFFLE_SEED_KEY = 'recipeBrowseShuffleSeed'
const FILTERS_KEY = 'recipeBrowseFilters'

interface PersistedFilters {
  mealType: MealType | null
  sortMode: SortMode
}

const DEFAULT_FILTERS: PersistedFilters = { mealType: null, sortMode: 'default' }

const isSortMode = (value: unknown): value is SortMode =>
  SORT_OPTIONS.some((option) => option.value === value)

// Filters persist for the browser session so they survive navigating into a recipe and back.
const loadFilters = (): PersistedFilters => {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY)
    if (!raw) return DEFAULT_FILTERS
    const parsed = JSON.parse(raw) as Partial<PersistedFilters>
    return {
      mealType: parsed.mealType && MEAL_TYPES.includes(parsed.mealType) ? parsed.mealType : null,
      sortMode: isSortMode(parsed.sortMode) ? parsed.sortMode : 'default',
    }
  } catch {
    return DEFAULT_FILTERS
  }
}

const RecipeBrowse = () => {
  const navigate = useNavigate()
  // Lazy init reads sessionStorage on every mount so filters are restored when this screen remounts.
  const [initialFilters] = useState(loadFilters)
  const [search, setSearch] = useState('')
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | null>(initialFilters.mealType)
  const [sortMode, setSortMode] = useState<SortMode>(initialFilters.sortMode)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Fetch the whole catalogue once so meal-type, search and sorting can all run client-side
  // (matching the Cook Now tab, which also loads everything).
  const { recipes, isLoading } = useRecipes({ page: 1, pageSize: 3000 })

  const activeFilterCount =
    (mealTypeFilter !== null ? 1 : 0) + (sortMode !== DEFAULT_FILTERS.sortMode ? 1 : 0)

  const resetFilters = () => {
    setMealTypeFilter(DEFAULT_FILTERS.mealType)
    setSortMode(DEFAULT_FILTERS.sortMode)
  }

  const handleTabChange = (value: string) => {
    if (value === 'match') navigate('/recipes')
  }

  useEffect(() => {
    const toStore: PersistedFilters = { mealType: mealTypeFilter, sortMode }
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify(toStore))
  }, [mealTypeFilter, sortMode])

  const [shuffleSeed] = useState(() => getSessionShuffleSeed(SHUFFLE_SEED_KEY))

  // Search + meal-type narrowing, before any ordering is applied.
  const searchedRecipes = useMemo(() => {
    const query = search.trim().toLowerCase()
    return recipes.filter(
      (recipe) =>
        (mealTypeFilter === null || recipe.mealTypes?.includes(mealTypeFilter)) &&
        (query === '' || recipe.title.toLowerCase().includes(query))
    )
  }, [recipes, mealTypeFilter, search])

  const displayedRecipes = useMemo(() => {
    if (sortMode === 'default') return searchedRecipes
    if (sortMode === 'shuffle') return seededShuffle(searchedRecipes, shuffleSeed)
    return [...searchedRecipes].sort(NUTRITION_COMPARATORS[sortMode])
  }, [searchedRecipes, sortMode, shuffleSeed])

  return (
    <div className="recipe-browse-page">
      <Tabs tabs={RECIPE_TABS} value="browse" onChange={handleTabChange} />

      <SearchBar
        placeholder="Search recipes..."
        onSearch={setSearch}
        filterAction={
          <button
            type="button"
            aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
            onClick={() => setIsFilterOpen(true)}
            className="recipe-browse-filter-btn"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {activeFilterCount > 0 && (
              <span className="recipe-browse-filter-btn-badge">{activeFilterCount}</span>
            )}
          </button>
        }
      />

      {isLoading && recipes.length === 0 ? (
        <Spinner fullScreen />
      ) : recipes.length === 0 ? (
        <EmptyState title="No recipes found" />
      ) : searchedRecipes.length === 0 ? (
        <EmptyState title={search.trim() ? `No recipes found for '${search.trim()}'` : 'No recipes match this filter'} />
      ) : (
        <>
          <p className="recipe-browse-count">
            {displayedRecipes.length} recipe{displayedRecipes.length === 1 ? '' : 's'}
          </p>
          <div className="recipe-browse-list">
            {displayedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                cuisine={recipe.cuisine}
                prepTimeMinutes={recipe.prepTimeMinutes}
                cookTimeMinutes={recipe.cookTimeMinutes}
                servings={recipe.servings}
                calories={recipe.calories}
                protein={recipe.protein}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
        </>
      )}

      <BottomSheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filters">
        <div className="recipe-browse-filter-groups">
          <div className="recipe-browse-filter">
            <span className="recipe-browse-filter-label">Meal type</span>
            <div className="recipe-browse-filter-chips">
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

          <div className="recipe-browse-filter">
            <span className="recipe-browse-filter-label">Sort by</span>
            <div className="recipe-browse-filter-chips">
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

          <div className="recipe-browse-filter-actions">
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

export default RecipeBrowse
