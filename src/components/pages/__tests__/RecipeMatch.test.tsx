import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import RecipeMatch from '@components/pages/RecipeMatch/RecipeMatch'
import { useRecipeMatch } from '@hooks/useRecipeMatch'
import { useRecipeRecommendation } from '@hooks/useRecipeRecommendation'
import { MatchedRecipe } from '@/types/recipes.types'

vi.mock('@hooks/useRecipeMatch')
vi.mock('@hooks/useRecipeRecommendation')

const mockedUseRecipeMatch = useRecipeMatch as unknown as ReturnType<typeof vi.fn>
const mockedUseRecipeRecommendation = useRecipeRecommendation as unknown as ReturnType<typeof vi.fn>

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

const matches: MatchedRecipe[] = [
  { id: 'recipe-1', title: 'Almost Makeable', imageUrl: null, totalIngredients: 5, matchedIngredients: 3, missingIngredients: [{ ingredientId: 'ing-1', name: 'Flour' }, { ingredientId: 'ing-2', name: 'Eggs' }], isFullyMakeable: false, mealTypes: ['lunch'] },
  { id: 'recipe-2', title: 'Fully Makeable', imageUrl: null, totalIngredients: 3, matchedIngredients: 3, missingIngredients: [], isFullyMakeable: true, mealTypes: ['breakfast'] },
]

const defaultRecommendation = {
  recommend: vi.fn(),
  clear: vi.fn(),
  recommendation: null,
  isLoading: false,
  error: null,
}

describe('RecipeMatch Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    sessionStorage.clear()
    mockedUseRecipeRecommendation.mockReturnValue({ ...defaultRecommendation, recommend: vi.fn(), clear: vi.fn() })
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

  it('renders every match with its makeable badge regardless of order', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(titles).toHaveLength(2)
    expect(titles).toContain('Fully Makeable')
    expect(titles).toContain('Almost Makeable')
    expect(screen.getByText('Makeable')).toBeInTheDocument()
    expect(screen.getByText('Pantry is missing 2 ingredients for this recipe')).toBeInTheDocument()
  })

  it('keeps the same order when remounting so navigating back does not reshuffle', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })

    const { unmount } = renderRecipeMatch()
    const firstOrder = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    unmount()

    // Simulates returning from the recipe detail screen — the seed persists in sessionStorage.
    renderRecipeMatch()
    const secondOrder = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)

    expect(secondOrder).toEqual(firstOrder)
    expect(firstOrder).toHaveLength(2)
  })

  it('filters the matches by the selected meal type', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Breakfast' }))

    const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(titles).toEqual(['Fully Makeable'])
    expect(screen.queryByText('Almost Makeable')).not.toBeInTheDocument()
  })

  it('shows a message when no matches have the selected meal type', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Dessert' }))

    expect(screen.getByText(/No recipes for this meal type/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('restores all matches when the meal type is cleared with "All"', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Breakfast' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
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

  it('shows maxMissing filter chips and the selected chip is marked active', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    const chip2 = screen.getByRole('button', { name: '2' })
    expect(chip2).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes the maxMissing filter when a chip is clicked', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    await user.click(screen.getByRole('button', { name: 'Any' }))
    expect(screen.getByRole('button', { name: 'Any' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows goal chips when matches exist', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.getByText("What's your goal today?")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cost-effective' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'High protein' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Light meal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Quick cook' })).toBeInTheDocument()
  })

  it('does not show goal chips when there are no matches', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.queryByText("What's your goal today?")).not.toBeInTheDocument()
  })

  it('calls recommend with the correct goal and recipes when a goal chip is clicked', async () => {
    const recommend = vi.fn()
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({ ...defaultRecommendation, recommend, clear: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Quick cook' }))

    expect(recommend).toHaveBeenCalledWith('quick-cook', expect.arrayContaining([
      expect.objectContaining({ id: 'recipe-2' }),
      expect.objectContaining({ id: 'recipe-1' }),
    ]))
  })

  it('calls clear when the selected goal chip is clicked again', async () => {
    const clear = vi.fn()
    const recommend = vi.fn()
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({ ...defaultRecommendation, recommend, clear })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Light meal' }))
    await user.click(screen.getByRole('button', { name: 'Light meal' }))

    expect(clear).toHaveBeenCalled()
  })

  it('shows the recommendation card with title, rationale and View Recipe button', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({
      ...defaultRecommendation,
      recommendation: { recommendedRecipeId: 'recipe-2', rationale: 'Great choice tonight.', goal: 'quick-cook' },
    })
    renderRecipeMatch()

    expect(screen.getByText(/today's pick/i)).toBeInTheDocument()
    expect(screen.getAllByText('Fully Makeable').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Great choice tonight.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Recipe →' })).toBeInTheDocument()
  })

  it('navigates to the recipe when View Recipe is clicked', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({
      ...defaultRecommendation,
      recommendation: { recommendedRecipeId: 'recipe-2', rationale: 'Great choice.', goal: 'quick-cook' },
    })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'View Recipe →' }))
    expect(navigateMock).toHaveBeenCalledWith('/recipes/recipe-2')
  })

  it('calls clear when the dismiss button on the recommendation card is clicked', async () => {
    const clear = vi.fn()
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({
      ...defaultRecommendation,
      clear,
      recommendation: { recommendedRecipeId: 'recipe-2', rationale: 'Great choice.', goal: 'quick-cook' },
    })
    const user = userEvent.setup()
    renderRecipeMatch()

    await user.click(screen.getByRole('button', { name: 'Dismiss recommendation' }))
    expect(clear).toHaveBeenCalled()
  })

  it('shows the loading skeleton while a recommendation is being fetched', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    mockedUseRecipeRecommendation.mockReturnValue({ ...defaultRecommendation, isLoading: true })
    renderRecipeMatch()
    expect(screen.getByLabelText('Loading recommendation')).toBeInTheDocument()
  })
})
