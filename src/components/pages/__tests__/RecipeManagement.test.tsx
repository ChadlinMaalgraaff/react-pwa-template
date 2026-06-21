import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import recipesService from '@/services/recipes.service'
import RecipeManagement from '@components/pages/RecipeManagement/RecipeManagement'
import { RecipeSummary } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    listRecipes: vi.fn(),
    deleteRecipe: vi.fn(),
    getTheMealDBCategories: vi.fn(),
    browseTheMealDB: vi.fn(),
    bulkImportRecipes: vi.fn(),
  },
}))

const mockedRecipesService = recipesService as unknown as Record<
  'listRecipes' | 'deleteRecipe' | 'getTheMealDBCategories' | 'browseTheMealDB' | 'bulkImportRecipes',
  ReturnType<typeof vi.fn>
>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeManagement = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeManagement />
      </MemoryRouter>
    </Provider>
  )

const recipes: RecipeSummary[] = [
  { id: 'recipe-1', title: 'Bobotie', imageUrl: null, cuisine: 'South African', prepTimeMinutes: 20, cookTimeMinutes: 40, servings: 4, isSaStaple: true },
  { id: 'recipe-2', title: 'Pasta', imageUrl: null, cuisine: 'Italian', prepTimeMinutes: 10, cookTimeMinutes: 20, servings: 2, isSaStaple: false },
]

describe('RecipeManagement Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedRecipesService.listRecipes.mockResolvedValue({ items: recipes, total: 2, page: 1, pageSize: 10 })
    mockedRecipesService.getTheMealDBCategories.mockResolvedValue({ categories: ['Beef', 'Chicken'] })
  })

  it('renders recipe rows with SA staple badge', async () => {
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    expect(screen.getByText('Pasta')).toBeInTheDocument()
    expect(screen.getByText('SA Staple', { selector: 'span' })).toBeInTheDocument()
  })

  it('navigates to the new recipe form', async () => {
    const user = userEvent.setup()
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Recipe' }))
    expect(navigateMock).toHaveBeenCalledWith('/admin/recipes/new')
  })

  it('opens the TheMealDB import modal', async () => {
    const user = userEvent.setup()
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Browse TheMealDB' }))
    expect(screen.getByRole('dialog', { name: 'Import from TheMealDB' })).toBeInTheDocument()
  })

  it('navigates to the recipe edit form', async () => {
    const user = userEvent.setup()
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    const editButtons = screen.getAllByRole('button', { name: 'Edit row' })
    await user.click(editButtons[0])
    expect(navigateMock).toHaveBeenCalledWith('/admin/recipes/recipe-1/edit')
  })

  it('filters by the South African cuisine chip', async () => {
    const user = userEvent.setup()
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'South African' }))

    await waitFor(() =>
      expect(mockedRecipesService.listRecipes).toHaveBeenLastCalledWith({
        page: 1,
        pageSize: 10,
        cuisine: 'South African',
      })
    )
  })

  it('deletes a recipe after confirmation', async () => {
    mockedRecipesService.deleteRecipe.mockResolvedValue({ id: 'recipe-2', message: 'Deleted' })
    const user = userEvent.setup()
    renderRecipeManagement()
    await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument())

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete row' })
    await user.click(deleteButtons[1])
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedRecipesService.deleteRecipe).toHaveBeenCalledWith('recipe-2'))
    await waitFor(() => expect(screen.queryByText('Pasta')).not.toBeInTheDocument())
  })
})
