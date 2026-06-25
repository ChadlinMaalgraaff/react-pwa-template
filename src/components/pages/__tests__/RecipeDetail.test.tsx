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
import { useCookingBrief } from '@hooks/useCookingBrief'
import { useCookingMode } from '@hooks/useCookingMode'
import { RecipeDetail as RecipeDetailType, CookingBriefSegment } from '@/types/recipes.types'
import { PantryItem } from '@/types/pantry.types'

vi.mock('@hooks/useRecipeDetail')
vi.mock('@hooks/useRecipeCost')
vi.mock('@hooks/useShoppingLists')
vi.mock('@hooks/usePantry')
vi.mock('@hooks/useCookingBrief')
vi.mock('@hooks/useCookingMode')

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
const mockedUseCookingBrief = useCookingBrief as unknown as ReturnType<typeof vi.fn>
const mockedUseCookingMode = useCookingMode as unknown as ReturnType<typeof vi.fn>

const idleBrief = {
  status: 'idle' as const,
  activeSegment: null,
  start: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
}

const idleCookingMode = {
  status: 'idle' as const,
  currentStepIndex: 0,
  currentStep: null,
  totalSteps: 0,
  start: vi.fn(),
  skipCountdown: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  replay: vi.fn(),
  next: vi.fn(),
  prev: vi.fn(),
  exit: vi.fn(),
}
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

const enrichedRecipe: RecipeDetailType = {
  ...fullyMakeableRecipe,
  prepTimeMinutes: 20,
  cookTimeMinutes: 45,
  servings: 6,
  calories: 400,
  protein: 25,
  fat: 30,
  carbs: 20,
  mealTypes: ['lunch', 'supper'],
}

const noCookRecipe: RecipeDetailType = {
  ...fullyMakeableRecipe,
  cookTimeMinutes: 0,
}

const partialNutritionRecipe: RecipeDetailType = {
  ...fullyMakeableRecipe,
  calories: 350,
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
    Element.prototype.scrollIntoView = vi.fn()
    mockedUseRecipeCost.mockReturnValue({ cost: null, fetchCost: vi.fn() })
    mockedUseShoppingLists.mockReturnValue({ lists: [] })
    mockedUsePantry.mockReturnValue({ items: pantryItems, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    mockedUseCookingBrief.mockReturnValue(idleBrief)
    mockedUseCookingMode.mockReturnValue(idleCookingMode)
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

  it('renders labelled prep, cook, and total times from enrichment data', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: enrichedRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText('Prep 20 min')).toBeInTheDocument()
    expect(screen.getByText('Cook 45 min')).toBeInTheDocument()
    expect(screen.getByText('Total 65 min')).toBeInTheDocument()
    expect(screen.getByText('Serves 6')).toBeInTheDocument()
  })

  it('shows "No cook" when cookTimeMinutes is 0', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: noCookRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText('No cook')).toBeInTheDocument()
    expect(screen.queryByText(/Cook 0/)).not.toBeInTheDocument()
  })

  it('renders capitalised meal-type chips for each mealTypes entry', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: enrichedRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText('Lunch')).toBeInTheDocument()
    expect(screen.getByText('Supper')).toBeInTheDocument()
  })

  it('renders the nutrition block with estimated label and all macros', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: enrichedRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText('Nutrition (per serving, estimated)')).toBeInTheDocument()
    expect(screen.getByText('400 kcal · Protein 25 g · Fat 30 g · Carbs 20 g')).toBeInTheDocument()
  })

  it('renders the nutrition block when only calories are present', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: partialNutritionRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText('Nutrition (per serving, estimated)')).toBeInTheDocument()
    expect(screen.getByText('350 kcal')).toBeInTheDocument()
  })

  it('omits the nutrition block when no macro data is present', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.queryByText('Nutrition (per serving, estimated)')).not.toBeInTheDocument()
  })

  it('omits meal-type chips when mealTypes is absent', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.queryByText('Lunch')).not.toBeInTheDocument()
    expect(screen.queryByText('Supper')).not.toBeInTheDocument()
  })

  it('shows the "Tell me about this dish" button when brief status is idle', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByRole('button', { name: /Tell me about this dish/i })).toBeInTheDocument()
  })

  it('calls brief.start when the trigger button is clicked', async () => {
    const start = vi.fn()
    mockedUseCookingBrief.mockReturnValue({ ...idleBrief, start })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    const user = userEvent.setup()
    renderRecipeDetail()

    await user.click(screen.getByRole('button', { name: /Tell me about this dish/i }))

    expect(start).toHaveBeenCalledOnce()
  })

  it('shows loading text and hides trigger button when brief status is loading', () => {
    mockedUseCookingBrief.mockReturnValue({ ...idleBrief, status: 'loading' as const })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByText(/Getting your cooking brief/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Tell me about this dish/i })).not.toBeInTheDocument()
  })

  it('renders CookingBriefBar when brief status is playing', () => {
    const introSegment: CookingBriefSegment = { type: 'intro', index: 0, text: 'Intro' }
    mockedUseCookingBrief.mockReturnValue({
      ...idleBrief,
      status: 'playing' as const,
      activeSegment: introSegment,
    })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByRole('region', { name: 'Cooking brief playback' })).toBeInTheDocument()
  })

  it('renders CookingBriefBar when brief status is paused', () => {
    const stepSegment: CookingBriefSegment = { type: 'step', index: 1, stepIndex: 0, text: 'Step 1' }
    mockedUseCookingBrief.mockReturnValue({
      ...idleBrief,
      status: 'paused' as const,
      activeSegment: stepSegment,
    })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.getByRole('region', { name: 'Cooking brief playback' })).toBeInTheDocument()
    expect(screen.getByText('Paused · Step 1 of 2')).toBeInTheDocument()
  })

  it('does not render CookingBriefBar when brief status is idle', () => {
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    expect(screen.queryByRole('region', { name: 'Cooking brief playback' })).not.toBeInTheDocument()
  })

  it('applies active step class to the correct step when playing', () => {
    const stepSegment: CookingBriefSegment = { type: 'step', index: 1, stepIndex: 0, text: 'Step 1' }
    mockedUseCookingBrief.mockReturnValue({
      ...idleBrief,
      status: 'playing' as const,
      activeSegment: stepSegment,
    })
    mockedUseRecipeDetail.mockReturnValue({ recipe: fullyMakeableRecipe, isLoading: false, error: null })
    renderRecipeDetail()

    const steps = document.querySelectorAll('.recipe-detail-step')
    expect(steps[0].classList).toContain('recipe-detail-step--active')
    expect(steps[1].classList).not.toContain('recipe-detail-step--active')
  })
})
