import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import shoppingListsService from '@/services/shopping-lists.service'
import RecipeDetail from '@components/pages/RecipeDetail/RecipeDetail'
import { useRecipeDetail } from '@hooks/useRecipeDetail'
import { useRecipeCost } from '@hooks/useRecipeCost'
import { useShoppingLists } from '@hooks/useShoppingLists'
import { RecipeDetail as RecipeDetailType } from '@/types/recipes.types'

vi.mock('@hooks/useRecipeDetail')
vi.mock('@hooks/useRecipeCost')
vi.mock('@hooks/useShoppingLists')

vi.mock('@/services/shopping-lists.service', () => ({
  default: {
    addRecipeToShoppingList: vi.fn(),
    createShoppingList: vi.fn(),
  },
}))

const mockedUseRecipeDetail = useRecipeDetail as unknown as ReturnType<typeof vi.fn>
const mockedUseRecipeCost = useRecipeCost as unknown as ReturnType<typeof vi.fn>
const mockedUseShoppingLists = useShoppingLists as unknown as ReturnType<typeof vi.fn>
const mockedShoppingListsService = shoppingListsService as unknown as Record<
  'addRecipeToShoppingList' | 'createShoppingList',
  ReturnType<typeof vi.fn>
>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock, useParams: () => ({ id: 'recipe-1' }) }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeDetail = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeDetail />
      </MemoryRouter>
    </Provider>
  )

const fullyMakeableRecipe: RecipeDetailType = {
  id: 'recipe-1',
  title: 'Bobotie',
  description: 'A classic',
  instructions: ['Brown the mince', 'Bake until set'],
  imageUrl: null,
  cuisine: 'South African',
  prepTimeMinutes: 20,
  cookTimeMinutes: 40,
  servings: 4,
  isSaStaple: true,
  ingredients: [
    { ingredientId: 'ing-1', name: 'Mince', quantity: 500, unit: 'g', isOptional: false, notes: null, inPantry: true },
    { ingredientId: 'ing-2', name: 'Bread', quantity: 2, unit: 'slices', isOptional: false, notes: null, inPantry: true },
  ],
}

const recipeWithMissing: RecipeDetailType = {
  ...fullyMakeableRecipe,
  ingredients: [
    fullyMakeableRecipe.ingredients[0],
    { ingredientId: 'ing-2', name: 'Bread', quantity: 2, unit: 'slices', isOptional: false, notes: null, inPantry: false },
  ],
}

const cost = {
  recipeId: 'recipe-1',
  missingIngredients: [
    { ingredientId: 'ing-2', name: 'Bread', quantity: 2, unit: 'slices', cheapestOffers: [] },
  ],
  cheapestSingleRetailer: null,
  cheapestCombination: { total: 15, byIngredient: {} },
  uncoveredIngredientIds: [],
}

describe('RecipeDetail Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedUseRecipeCost.mockReturnValue({ cost: null, fetchCost: vi.fn() })
    mockedUseShoppingLists.mockReturnValue({ lists: [] })
    mockedShoppingListsService.addRecipeToShoppingList.mockResolvedValue({ addedItems: [{ id: 'item-1' }], skippedAlreadyInPantry: [] })
    mockedShoppingListsService.createShoppingList.mockResolvedValue({ id: 'list-1', name: 'My list', items: [], createdAt: '2026-01-01T00:00:00Z' })
  })

  it('shows a spinner while loading', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: null, isLoading: true, error: null })
    renderRecipeDetail()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows a not found state when the recipe is missing', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: null, isLoading: false, error: 'Not found' })
    renderRecipeDetail()
    expect(screen.getByText('Recipe not found')).toBeInTheDocument()
  })

  it('renders title, meta, ingredients and instructions', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()
    expect(screen.getByRole('heading', { name: 'Bobotie' })).toBeInTheDocument()
    expect(screen.getByText('South African')).toBeInTheDocument()
    expect(screen.getByText('Mince')).toBeInTheDocument()
    expect(screen.getByText('Brown the mince')).toBeInTheDocument()
  })

  it('hides the "Add missing to shopping list" button when fully makeable', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()
    expect(screen.queryByRole('button', { name: 'Add missing to shopping list' })).not.toBeInTheDocument()
  })

  it('shows the cost panel and sticky button when ingredients are missing', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: recipeWithMissing, isLoading: false, error: null })
    mockedUseRecipeCost.mockReturnValue({ cost, fetchCost: vi.fn() })
    renderRecipeDetail()
    expect(screen.getByRole('button', { name: 'Add missing to shopping list' })).toBeInTheDocument()
    expect(screen.getByText('Cost Breakdown')).toBeInTheDocument()
  })

  it('adds directly to the only shopping list and navigates to it', async () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: recipeWithMissing, isLoading: false, error: null })
    mockedUseRecipeCost.mockReturnValue({ cost, fetchCost: vi.fn() })
    mockedUseShoppingLists.mockReturnValue({ lists: [{ id: 'list-1', name: 'My list', itemCount: 0, createdAt: '2026-01-01T00:00:00Z' }] })
    const user = userEvent.setup()
    renderRecipeDetail()

    await user.click(screen.getByRole('button', { name: 'Add missing to shopping list' }))

    await waitFor(() => expect(mockedShoppingListsService.addRecipeToShoppingList).toHaveBeenCalledWith('list-1', 'recipe-1'))
    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists/list-1')
  })

  it('creates a new shopping list when the user has none, then adds the recipe', async () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: recipeWithMissing, isLoading: false, error: null })
    mockedUseRecipeCost.mockReturnValue({ cost, fetchCost: vi.fn() })
    mockedUseShoppingLists.mockReturnValue({ lists: [] })
    const user = userEvent.setup()
    renderRecipeDetail()

    await user.click(screen.getByRole('button', { name: 'Add missing to shopping list' }))

    await waitFor(() => expect(mockedShoppingListsService.createShoppingList).toHaveBeenCalled())
    await waitFor(() => expect(mockedShoppingListsService.addRecipeToShoppingList).toHaveBeenCalledWith('list-1', 'recipe-1'))
    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists/list-1')
  })

  it('opens a picker when the user has multiple shopping lists', async () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: recipeWithMissing, isLoading: false, error: null })
    mockedUseRecipeCost.mockReturnValue({ cost, fetchCost: vi.fn() })
    mockedUseShoppingLists.mockReturnValue({
      lists: [
        { id: 'list-1', name: 'List One', itemCount: 0, createdAt: '2026-01-01T00:00:00Z' },
        { id: 'list-2', name: 'List Two', itemCount: 0, createdAt: '2026-01-01T00:00:00Z' },
      ],
    })
    const user = userEvent.setup()
    renderRecipeDetail()

    await user.click(screen.getByRole('button', { name: 'Add missing to shopping list' }))

    expect(screen.getByRole('dialog', { name: 'Choose a shopping list' })).toBeInTheDocument()
    await user.click(screen.getByText('List Two'))

    await waitFor(() => expect(mockedShoppingListsService.addRecipeToShoppingList).toHaveBeenCalledWith('list-2', 'recipe-1'))
    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists/list-2')
  })
})
