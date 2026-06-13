import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, SearchBar, Chip, Button, EmptyState, Spinner, type TabOption } from '@components/shared'
import { RecipeCard } from '@components/recipes'
import { useRecipes } from '@hooks/useRecipes'
import './RecipeBrowse.css'

const RECIPE_TABS: TabOption[] = [
  { value: 'match', label: 'Cook Now' },
  { value: 'browse', label: 'Browse' },
]

const CUISINE_FILTERS = ['South African', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Mediterranean']

const PAGE_SIZE = 10

const RecipeBrowse = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const { recipes, total, isLoading, setParams } = useRecipes({ page: 1, pageSize: PAGE_SIZE })

  useEffect(() => {
    setParams({
      page: 1,
      pageSize,
      search: search || undefined,
      cuisine: cuisineFilter && cuisineFilter !== 'South African' ? cuisineFilter : undefined,
      isSaStaple: cuisineFilter === 'South African' ? true : undefined,
    })
  }, [search, cuisineFilter, pageSize, setParams])

  const handleTabChange = (value: string) => {
    if (value === 'match') navigate('/recipes')
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPageSize(PAGE_SIZE)
  }

  const handleCuisineSelect = (cuisine: string) => {
    setCuisineFilter((prev) => (prev === cuisine ? null : cuisine))
    setPageSize(PAGE_SIZE)
  }

  return (
    <div className="recipe-browse-page">
      <Tabs tabs={RECIPE_TABS} value="browse" onChange={handleTabChange} />

      <SearchBar placeholder="Search recipes..." onSearch={handleSearch} />

      <div className="recipe-browse-cuisines">
        {CUISINE_FILTERS.map((cuisine) => (
          <Chip key={cuisine} selected={cuisineFilter === cuisine} onClick={() => handleCuisineSelect(cuisine)}>
            {cuisine}
          </Chip>
        ))}
      </div>

      {isLoading && recipes.length === 0 ? (
        <Spinner fullScreen />
      ) : recipes.length === 0 ? (
        <EmptyState title={search ? `No recipes found for '${search}'` : 'No recipes found'} />
      ) : (
        <>
          <div className="recipe-browse-list">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                cuisine={recipe.cuisine}
                prepTimeMinutes={recipe.prepTimeMinutes}
                cookTimeMinutes={recipe.cookTimeMinutes}
                servings={recipe.servings}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              />
            ))}
          </div>
          {recipes.length < total && (
            <Button variant="secondary" onClick={() => setPageSize((prev) => prev + PAGE_SIZE)} isLoading={isLoading}>
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export default RecipeBrowse
