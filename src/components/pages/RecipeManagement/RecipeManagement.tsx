import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, SearchBar, Chip, Badge, ConfirmDialog } from '@components/shared'
import { DataTable, DataTableColumn, TheMealDBImportModal } from '@components/admin'
import { useRecipes } from '@hooks/useRecipes'
import { useRecipeAdmin } from '@hooks/useRecipeAdmin'
import { RecipeSummary } from '@/types/recipes.types'
import './RecipeManagement.css'

const CUISINE_FILTERS = ['South African', 'Italian', 'Indian', 'Chinese', 'Mexican', 'Mediterranean']

const PAGE_SIZE = 10

const RecipeManagement = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [saStapleOnly, setSaStapleOnly] = useState(false)
  const [page, setPage] = useState(1)
  const { recipes, total, isLoading, setParams } = useRecipes({ page: 1, pageSize: PAGE_SIZE })
  const { deleteRecipe, isSaving } = useRecipeAdmin()
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())
  const [deletingRecipe, setDeletingRecipe] = useState<RecipeSummary | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  useEffect(() => {
    setParams({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      cuisine: cuisineFilter ?? undefined,
      isSaStaple: saStapleOnly || undefined,
    })
  }, [search, cuisineFilter, saStapleOnly, page, setParams])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleCuisineSelect = (cuisine: string) => {
    setCuisineFilter((prev) => (prev === cuisine ? null : cuisine))
    setPage(1)
  }

  const toggleSaStaple = () => {
    setSaStapleOnly((prev) => !prev)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deletingRecipe) return
    try {
      await deleteRecipe(deletingRecipe.id)
      setDeletedIds((prev) => new Set(prev).add(deletingRecipe.id))
      setDeletingRecipe(null)
    } catch {
      // error notification already dispatched by useRecipeAdmin
    }
  }

  const visibleRecipes = recipes.filter((recipe) => !deletedIds.has(recipe.id))

  const columns: DataTableColumn<RecipeSummary>[] = [
    { key: 'title', header: 'Title' },
    { key: 'cuisine', header: 'Cuisine', render: (row) => row.cuisine ?? '-' },
    { key: 'servings', header: 'Servings', render: (row) => row.servings ?? '-' },
    {
      key: 'isSaStaple',
      header: 'SA Staple',
      render: (row) => (row.isSaStaple ? <Badge variant="accent">SA Staple</Badge> : null),
    },
  ]

  return (
    <div className="recipe-management-page">
      <div className="recipe-management-header">
        <h1 className="recipe-management-title">Recipes</h1>
        <div className="recipe-management-actions">
          <Button type="button" variant="secondary" onClick={() => setIsImportModalOpen(true)}>
            Browse TheMealDB
          </Button>
          <Button type="button" onClick={() => navigate('/admin/recipes/new')}>
            + New Recipe
          </Button>
        </div>
      </div>

      <div className="recipe-management-filters">
        <SearchBar placeholder="Search recipes..." onSearch={handleSearch} />
        <div className="recipe-management-cuisines">
          {CUISINE_FILTERS.map((cuisine) => (
            <Chip key={cuisine} selected={cuisineFilter === cuisine} onClick={() => handleCuisineSelect(cuisine)}>
              {cuisine}
            </Chip>
          ))}
          <Chip selected={saStapleOnly} onClick={toggleSaStaple}>
            SA Staple
          </Chip>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={visibleRecipes}
        getRowId={(row) => row.id}
        onEdit={(row) => navigate(`/admin/recipes/${row.id}/edit`)}
        onDelete={setDeletingRecipe}
        emptyMessage="No recipes found."
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <TheMealDBImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => setParams({ page: 1, pageSize: PAGE_SIZE })}
      />

      <ConfirmDialog
        isOpen={!!deletingRecipe}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${deletingRecipe?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isSaving}
        onConfirm={handleDelete}
        onCancel={() => setDeletingRecipe(null)}
      />
    </div>
  )
}

export default RecipeManagement
