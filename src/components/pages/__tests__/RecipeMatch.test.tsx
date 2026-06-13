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

const matches: MatchedRecipe[] = [
  { id: 'recipe-1', title: 'Almost Makeable', imageUrl: null, totalIngredients: 5, matchedIngredients: 3, missingIngredients: [{ ingredientId: 'ing-1', name: 'Flour' }, { ingredientId: 'ing-2', name: 'Eggs' }], isFullyMakeable: false },
  { id: 'recipe-2', title: 'Fully Makeable', imageUrl: null, totalIngredients: 3, matchedIngredients: 3, missingIngredients: [], isFullyMakeable: true },
]

describe('RecipeMatch Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('shows a spinner while loading', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: true, refetch: vi.fn() })
    renderRecipeMatch()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows an empty state with a link to the pantry when there are no matches', async () => {
    mockedUseRecipeMatch.mockReturnValue({ matches: [], isLoading: false, refetch: vi.fn() })
    const user = userEvent.setup()
    renderRecipeMatch()
    expect(screen.getByText('Add items to your pantry to see recipe matches')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Go to Pantry' }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry')
  })

  it('renders fully makeable recipes before almost makeable ones', () => {
    mockedUseRecipeMatch.mockReturnValue({ matches, isLoading: false, refetch: vi.fn() })
    renderRecipeMatch()
    const titles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent)
    expect(titles).toEqual(['Fully Makeable', 'Almost Makeable'])
    expect(screen.getByText('Makeable')).toBeInTheDocument()
    expect(screen.getByText('Missing 2')).toBeInTheDocument()
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
})
