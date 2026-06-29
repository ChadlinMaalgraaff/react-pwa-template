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
import RecipeBrowse from '@components/pages/RecipeBrowse/RecipeBrowse'
import { RecipeSummary } from '@/types/recipes.types'

vi.mock('@/services/recipes.service', () => ({
  default: {
    listRecipes: vi.fn(),
  },
}))

const mockedRecipesService = recipesService as unknown as Record<'listRecipes', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeBrowse = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeBrowse />
      </MemoryRouter>
    </Provider>
  )

const recipes: RecipeSummary[] = [
  { id: 'recipe-1', title: 'Bobotie', imageUrl: null, cuisine: 'South African', prepTimeMinutes: 20, cookTimeMinutes: 40, servings: 4, isSaStaple: true },
]

describe('RecipeBrowse Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedRecipesService.listRecipes.mockResolvedValue({ items: recipes, total: 1, page: 1, pageSize: 10 })
  })

  it('renders recipe cards without a match badge', async () => {
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    expect(screen.queryByText('Makeable')).not.toBeInTheDocument()
    expect(screen.queryByText(/Missing/)).not.toBeInTheDocument()
  })

  it('shows an empty state with the search term when no recipes are found', async () => {
    mockedRecipesService.listRecipes.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 })
    const user = userEvent.setup()
    renderRecipeBrowse()
    await user.type(screen.getByRole('searchbox'), 'Pasta')

    await waitFor(() => expect(screen.getByText("No recipes found for 'Pasta'")).toBeInTheDocument())
    expect(mockedRecipesService.listRecipes).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, search: 'Pasta' })
  })

  it('filters by the South African cuisine chip using isSaStaple', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'South African' }))

    await waitFor(() =>
      expect(mockedRecipesService.listRecipes).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, isSaStaple: true })
    )
  })

  it('filters by the selected meal type chip', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    await waitFor(() =>
      expect(mockedRecipesService.listRecipes).toHaveBeenLastCalledWith({ page: 1, pageSize: 10, mealType: 'breakfast' })
    )
  })

  it('navigates to the recipe detail when a card is clicked', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    await user.click(screen.getByText('Bobotie'))
    expect(navigateMock).toHaveBeenCalledWith('/recipes/recipe-1')
  })

  it('navigates to the match screen when the Cook Now tab is selected', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: 'Cook Now' }))
    expect(navigateMock).toHaveBeenCalledWith('/recipes')
  })
})
