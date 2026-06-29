import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import RecipeMatch from '@components/pages/RecipeMatch/RecipeMatch'
import { useRecipeMatch } from '@hooks/useRecipeMatch'
import { MatchedRecipe } from '@/types/recipes.types'

vi.mock('@hooks/useRecipeMatch')

const mockedUseRecipeMatch = useRecipeMatch as unknown as ReturnType<typeof vi.fn>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeMatch = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeMatch />
      </MemoryRouter>
    </Provider>
  )

// recipe-1 (Almost) and recipe-2 (Fully) have nutrition picked so each sort produces a
// predictable order: Best match => [Fully, Almost]; protein/low-carb/low-fat/filling => [Almost, Fully].
const matches: MatchedRecipe[] = [
  { id: 'recipe-1', title: 'Almost Makeable', imageUrl: null, totalIngredients: 5, matchedIngredients: 3, missingIngredients: [{ ingredientId: 'ing-1', name: 'Flour' }, { ingredientId: 'ing-2', name: 'Eggs' }], isFullyMakeable: false, mealTypes: ['lunch'], calories: 600, protein: 40, fat: 5, carbs: 20 },
  { id: 'recipe-2', title: 'Fully Makeable', imageUrl: null, totalIngredients: 3, matchedIngredients: 3, missingIngredients: [], isFullyMakeable: true, mealTypes: ['breakfast'], calories: 300, protein: 10, fat: 30, carbs: 50 },
]

const titleOrder = () => screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)

const openFilters = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: /filters/i }))

const selectSort = async (user: ReturnType<typeof userEvent.setup>, label: string) => {
  await openFilters(user)
  await user.click(screen.getByRole('button', { name: label }))
}

describe('RecipeMatch Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    sessionStorage.clear()
  })

  it('shows a spinner while loading', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: true, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows an empty state with scan and manual add CTAs when there are no matches', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    expect(screen.getByText('No recipes found yet')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /scan your pantry/i }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry/capture')
  })

  it('navigates to pantry when Add Items Manually is clicked on empty state', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await user.click(screen.getByRole('button', { name: /add items manually/i }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry')
  })

  it('renders every match with its makeable badge', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(titleOrder()).toHaveLength(2)
    expect(screen.getByText('Makeable')).toBeInTheDocument()
    expect(screen.getByText('Pantry is missing 2 ingredients for this recipe')).toBeInTheDocument()
  })

  it('sorts fully-makeable recipes first by default', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(titleOrder()).toEqual(['Fully Makeable', 'Almost Makeable'])
  })

  it('keeps the same order when remounting so navigating back does not reshuffle', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })

    const { unmount } = renderRecipeMatch()
    const firstOrder = titleOrder()
    unmount()

    renderRecipeMatch()
    expect(titleOrder()).toEqual(firstOrder)
  })

  it('shows estimated nutrition on each card', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.getByText('Est. 600 kcal · 40g protein')).toBeInTheDocument()
    expect(screen.getByText('Est. 300 kcal · 10g protein')).toBeInTheDocument()
  })

  it('shows the number of results being displayed', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.getByText('2 recipes you can cook')).toBeInTheDocument()
  })

  it('uses the singular form when a single result is shown', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    expect(screen.getByText('1 recipe you can cook')).toBeInTheDocument()
  })

  it('navigates to the recipe detail when a card is clicked', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await user.click(screen.getByText('Fully Makeable'))
    expect(navigateMock).toHaveBeenCalledWith('/recipes/recipe-2')
  })

  it('navigates to the browse screen when the Browse tab is selected', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await user.click(screen.getByRole('tab', { name: 'Browse' }))
    expect(navigateMock).toHaveBeenCalledWith('/recipes/browse')
  })

  it('keeps the filter controls hidden until the filter button is clicked', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    expect(screen.queryByRole('button', { name: 'Best match' })).not.toBeInTheDocument()
    await openFilters(user)
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Best match' })).toBeInTheDocument()
  })

  it('does not show any AI recommendation controls', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    expect(screen.queryByText("What's your goal today?")).not.toBeInTheDocument()
    await openFilters(user)
    expect(screen.queryByRole('button', { name: /cost-effective/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /quick cook/i })).not.toBeInTheDocument()
  })

  it('shows maxMissing filter chips and the selected chip is marked active', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await openFilters(user)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the maxMissing filter when a chip is clicked', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Any' }))
    expect(screen.getByRole('button', { name: 'Any' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('filters the matches by the selected meal type', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    expect(titleOrder()).toEqual(['Fully Makeable'])
    expect(screen.queryByText('Almost Makeable')).not.toBeInTheDocument()
  })

  it('shows a message when no matches have the selected meal type', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Dessert' }))

    expect(screen.getByText(/No recipes for this meal type/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('restores all matches when the meal type is cleared with "All"', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Breakfast' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('filters the list by the search box', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.type(screen.getByRole('searchbox'), 'fully')
    await waitFor(() => expect(titleOrder()).toEqual(['Fully Makeable']))
  })

  it('shows a no-results message when the search matches nothing', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.type(screen.getByRole('searchbox'), 'zzz')
    expect(await screen.findByText(/No recipes match "zzz"/i)).toBeInTheDocument()
  })

  it('sorts by highest protein', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await selectSort(user, 'Highest protein')
    expect(titleOrder()).toEqual(['Almost Makeable', 'Fully Makeable'])
  })

  it('sorts by lowest carb', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await selectSort(user, 'Lowest carb')
    expect(titleOrder()).toEqual(['Almost Makeable', 'Fully Makeable'])
  })

  it('sorts by lowest fat', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await selectSort(user, 'Lowest fat')
    expect(titleOrder()).toEqual(['Almost Makeable', 'Fully Makeable'])
  })

  it('sorts by most filling (highest calories)', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await selectSort(user, 'Most filling')
    expect(titleOrder()).toEqual(['Almost Makeable', 'Fully Makeable'])
  })

  it('sorts by lightest (fewest calories)', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await selectSort(user, 'Lightest')
    expect(titleOrder()).toEqual(['Fully Makeable', 'Almost Makeable'])
  })

  it('selects "Surprise me" as the active sort', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await selectSort(user, 'Surprise me')
    expect(screen.getByRole('button', { name: 'Surprise me' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Best match' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('restores persisted filters from sessionStorage on mount', async () => {
    sessionStorage.setItem(
      'recipeMatchFilters',
      JSON.stringify({ maxMissing: undefined, mealType: 'breakfast', sortMode: 'protein' })
    )
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    expect(screen.getByRole('button', { name: 'Any' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Breakfast' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Highest protein' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('badges the filter button with the number of non-default filters', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Any' }))

    expect(screen.getByRole('button', { name: /filters \(1 active\)/i })).toBeInTheDocument()
  })

  it('clears all filters back to defaults with Reset', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await openFilters(user)
    await user.click(screen.getByRole('button', { name: 'Any' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })
})
