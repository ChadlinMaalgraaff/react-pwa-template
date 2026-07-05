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
  { id: 'recipe-1', title: 'Bobotie', imageUrl: null, cuisine: 'South African', prepTimeMinutes: 20, cookTimeMinutes: 40, servings: 4, isSaStaple: true, mealTypes: ['supper'], calories: 600, protein: 40, fat: 5, carbs: 20 },
  { id: 'recipe-2', title: 'Pap', imageUrl: null, cuisine: 'South African', prepTimeMinutes: 5, cookTimeMinutes: 20, servings: 4, isSaStaple: true, mealTypes: ['breakfast'], calories: 300, protein: 10, fat: 30, carbs: 50 },
]

const titleOrder = () => screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)

const openFilters = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /filters/i }))

const selectSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await openFilters(user)
  await user.click(screen.getByRole('button', { name: label }))
}

describe('RecipeBrowse Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    sessionStorage.clear()
    mockedRecipesService.listRecipes.mockResolvedValue({ items: recipes, total: recipes.length, page: 1, pageSize: 3000 })
  })

  it('fetches the whole catalogue once', async () => {
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    expect(mockedRecipesService.listRecipes).toHaveBeenCalledTimes(1)
    expect(mockedRecipesService.listRecipes).toHaveBeenCalledWith({ page: 1, pageSize: 3000 })
  })

  it('renders recipe cards without a match badge', async () => {
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())
    expect(screen.queryByText('Makeable')).not.toBeInTheDocument()
    expect(screen.queryByText(/Missing/)).not.toBeInTheDocument()
  })

  it('shows estimated nutrition on each card', async () => {
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Est. 600 kcal · 40g protein')).toBeInTheDocument())
    expect(screen.getByText('Est. 300 kcal · 10g protein')).toBeInTheDocument()
  })

  it('shows the number of results being displayed', async () => {
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('2 recipes')).toBeInTheDocument())
  })

  it('shows an empty state with the search term when no recipes match the search', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await user.type(screen.getByRole('searchbox'), 'Pasta')
    expect(await screen.findByText("No recipes found for 'Pasta'")).toBeInTheDocument()
  })

  it('keeps the filter controls hidden until the filter button is clicked', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    expect(screen.queryByRole('button', { name: 'Highest protein' })).not.toBeInTheDocument()
    await openFilters(user)
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Highest protein' })).toBeInTheDocument()
  })

  it('filters by the selected meal type chip', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    expect(titleOrder()).toEqual(['Pap'])
    expect(screen.queryByText('Bobotie')).not.toBeInTheDocument()
  })

  it('sorts by highest protein', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await selectSort(user, 'Highest protein')
    expect(titleOrder()).toEqual(['Bobotie', 'Pap'])
  })

  it('sorts by lightest (fewest calories)', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await selectSort(user, 'Lightest')
    expect(titleOrder()).toEqual(['Pap', 'Bobotie'])
  })

  it('badges the filter button with the number of non-default filters', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    expect(screen.getByRole('button', { name: /filters \(1 active\)/i })).toBeInTheDocument()
  })

  it('clears all filters back to defaults with Reset', async () => {
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Bobotie')).toBeInTheDocument())

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })

  it('restores persisted filters from sessionStorage on mount', async () => {
    sessionStorage.setItem('recipeBrowseFilters', JSON.stringify({ mealType: 'breakfast', sortMode: 'protein' }))
    const user = userEvent.setup()
    renderRecipeBrowse()
    await waitFor(() => expect(screen.getByText('Pap')).toBeInTheDocument())

    await openFilters(user)
    expect(screen.getByRole('button', { name: 'Breakfast' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Highest protein' })).toHaveAttribute('aria-pressed', 'true')
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
