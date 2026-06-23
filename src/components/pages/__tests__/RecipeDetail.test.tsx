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
import { usePantry } from '@hooks/usePantry'
import { RecipeDetail as RecipeDetailType } from '@/types/recipes.types'
import { PantryItem } from '@/types/pantry.types'

vi.mock('@hooks/useRecipeDetail')
vi.mock('@hooks/useRecipeCost')
vi.mock('@hooks/useShoppingLists')
vi.mock('@hooks/usePantry')

vi.mock('@/services/shopping-lists.service', () => ({
  default: {
    addRecipeToShoppingList: vi.fn(),
    createShoppingList: vi.fn(),
  },
}))

const mockedUseRecipeDetail = useRecipeDetail as unknown as ReturnType<typeof vi.fn>
const mockedUseRecipeCost = useRecipeCost as unknown as ReturnType<typeof vi.fn>
const mockedUseShoppingLists = useShoppingLists as unknown as ReturnType<typeof vi.fn>
const mockedUsePantry = usePantry as unknown as ReturnType<typeof vi.fn>
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

const pantryItems: PantryItem[] = [
  { id: 'pantry-item-1', ingredientId: 'ing-1', ingredientName: 'Mince', category: 'Meat', quantity: 500, unit: 'g', source: 'manual', addedAt: '2026-01-01T00:00:00Z' },
]

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
  imageAuthor: null,
  imageLicense: null,
  imageSourceUrl: null,
  sourceName: null,
  sourceUrl: null,
  sourceLicense: null,
  source: 'generated',
}

const recipeWithMissing: RecipeDetailType = {
  ...fullyMakeableRecipe,
  ingredients: [
    fullyMakeableRecipe.ingredients[0],
    { ingredientId: 'ing-2', name: 'Bread', quantity: 2, unit: 'slices', isOptional: false, notes: null, inPantry: false },
  ],
}

const attributedRecipe: RecipeDetailType = {
  ...fullyMakeableRecipe,
  imageUrl: 'https://upload.wikimedia.org/Tomato_bredie.jpg',
  imageAuthor: 'Olga Ernst',
  imageLicense: 'CC BY-SA 4.0',
  imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Tomato_bredie.jpg',
  sourceName: 'Wikibooks Cookbook',
  sourceUrl: 'https://en.wikibooks.org/wiki/Cookbook:Tomato_Bredie',
  sourceLicense: 'CC BY-SA 4.0',
  source: 'wikibooks',
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
    mockedUsePantry.mockReturnValue({ items: pantryItems, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
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

  it('shows the missing ingredients panel when ingredients are missing', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: recipeWithMissing, isLoading: false, error: null })
    mockedUseRecipeCost.mockReturnValue({ cost, fetchCost: vi.fn() })
    renderRecipeDetail()
    expect(screen.getByText('Missing ingredients in pantry')).toBeInTheDocument()
  })

  it('shows the I made this button when recipe has in-pantry ingredients', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()
    expect(screen.getByRole('button', { name: 'I made this' })).toBeInTheDocument()
  })

  it('opens the Mark as cooked sheet and calls removeItem for selected ingredients', async () => {
    const removeItem = vi.fn().mockResolvedValue(undefined)
    mockedUsePantry.mockReturnValue({ items: pantryItems, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem, clearAll: vi.fn() })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    const user = userEvent.setup()
    renderRecipeDetail()

    await user.click(screen.getByRole('button', { name: 'I made this' }))
    expect(screen.getByRole('dialog', { name: 'Mark as cooked' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove selected' }))
    await waitFor(() => expect(removeItem).toHaveBeenCalledWith('pantry-item-1'))
  })

  it('renders photo and recipe credits with working links when attribution is present', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: attributedRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    const commonsLink = screen.getByRole('link', { name: 'Wikimedia Commons' })
    expect(commonsLink).toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:Tomato_bredie.jpg')

    expect(screen.getByText(/Photo: Olga Ernst/)).toBeInTheDocument()
    expect(screen.getByText(/Recipe adapted from/)).toBeInTheDocument()
    expect(screen.getByText(/Modified \(units converted to metric/)).toBeInTheDocument()

    const sourceLink = screen.getByRole('link', { name: 'Wikibooks Cookbook' })
    expect(sourceLink).toHaveAttribute('href', 'https://en.wikibooks.org/wiki/Cookbook:Tomato_Bredie')

    const licenseLinks = screen.getAllByRole('link', { name: 'CC BY-SA 4.0' })
    expect(licenseLinks).toHaveLength(2)
    licenseLinks.forEach((link) =>
      expect(link).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/')
    )
  })

  it('renders no credit blocks for a recipe with null attribution', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.queryByText(/Photo:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Recipe adapted from/)).not.toBeInTheDocument()
  })
})
