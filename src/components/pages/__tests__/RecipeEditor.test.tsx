import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import { useRecipeDetail } from '@hooks/useRecipeDetail'
import { useRecipeAdmin } from '@hooks/useRecipeAdmin'
import RecipeEditor from '@components/pages/RecipeEditor/RecipeEditor'
import { RecipeDetail } from '@/types/recipes.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

const mockedIngredientsService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

vi.mock('@hooks/useRecipeDetail')
vi.mock('@hooks/useRecipeAdmin')

const mockedUseRecipeDetail = useRecipeDetail as unknown as ReturnType<typeof vi.fn>
const mockedUseRecipeAdmin = useRecipeAdmin as unknown as ReturnType<typeof vi.fn>

const navigateMock = vi.fn()
let paramsMock: { id?: string } = {}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock, useParams: () => paramsMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeEditor = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeEditor />
      </MemoryRouter>
    </Provider>
  )

const createRecipeMock = vi.fn()
const updateRecipeMock = vi.fn()

const recipe: RecipeDetail = {
  id: 'recipe-1',
  title: 'Bobotie',
  description: 'A classic South African bake.',
  instructions: ['Preheat oven', 'Mix ingredients'],
  imageUrl: null,
  cuisine: 'South African',
  prepTimeMinutes: 20,
  cookTimeMinutes: 40,
  servings: 4,
  isSaStaple: true,
  ingredients: [
    { ingredientId: 'ing-1', name: 'Mince', quantity: 500, unit: 'g', isOptional: false, notes: null, inPantry: true },
  ],
}

describe('RecipeEditor Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    createRecipeMock.mockClear()
    updateRecipeMock.mockClear()
    paramsMock = {}
    mockedIngredientsService.listIngredients.mockResolvedValue([])
    mockedUseRecipeDetail.mockReturnValue({ recipe: null, isLoading: false, error: null })
    mockedUseRecipeAdmin.mockReturnValue({
      createRecipe: createRecipeMock,
      updateRecipe: updateRecipeMock,
      isSaving: false,
      error: null,
    })
  })

  it('renders New Recipe title in create mode', () => {
    renderRecipeEditor()
    expect(screen.getByRole('heading', { name: 'New Recipe' })).toBeInTheDocument()
  })

  it('shows a validation error when saving without a title', async () => {
    const user = userEvent.setup()
    renderRecipeEditor()

    await user.click(screen.getByRole('button', { name: 'Save Recipe' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(createRecipeMock).not.toHaveBeenCalled()
  })

  it('creates a new recipe and navigates to the recipe list', async () => {
    const user = userEvent.setup()
    createRecipeMock.mockResolvedValue({ id: 'recipe-new' })
    renderRecipeEditor()

    await user.type(screen.getByLabelText(/^Title/), 'New Bake')
    await user.click(screen.getByRole('button', { name: 'Save Recipe' }))

    await waitFor(() =>
      expect(createRecipeMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Bake', instructions: [], ingredients: [] })
      )
    )
    expect(navigateMock).toHaveBeenCalledWith('/admin/recipes')
  })

  it('prefills the form with existing recipe data in edit mode', async () => {
    paramsMock = { id: 'recipe-1' }
    mockedUseRecipeDetail.mockReturnValue({ recipe, isLoading: false, error: null })
    renderRecipeEditor()

    expect(screen.getByRole('heading', { name: 'Edit Recipe' })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Title/)).toHaveValue('Bobotie')
    expect(screen.getByLabelText('Description')).toHaveValue('A classic South African bake.')
    expect(screen.getByRole('button', { name: 'SA Staple' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('updates an existing recipe on save', async () => {
    paramsMock = { id: 'recipe-1' }
    mockedUseRecipeDetail.mockReturnValue({ recipe, isLoading: false, error: null })
    updateRecipeMock.mockResolvedValue({ id: 'recipe-1' })
    const user = userEvent.setup()
    renderRecipeEditor()

    await user.click(screen.getByRole('button', { name: 'Save Recipe' }))

    await waitFor(() =>
      expect(updateRecipeMock).toHaveBeenCalledWith(
        'recipe-1',
        expect.objectContaining({ title: 'Bobotie' })
      )
    )
    expect(navigateMock).toHaveBeenCalledWith('/admin/recipes')
  })

  it('adds and removes ingredient rows', async () => {
    const user = userEvent.setup()
    renderRecipeEditor()

    expect(screen.getAllByRole('button', { name: 'Remove ingredient' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '+ Add Ingredient' }))
    expect(screen.getAllByRole('button', { name: 'Remove ingredient' })).toHaveLength(2)

    await user.click(screen.getAllByRole('button', { name: 'Remove ingredient' })[0])
    expect(screen.getAllByRole('button', { name: 'Remove ingredient' })).toHaveLength(1)
  })

  it('shows a spinner while loading recipe details in edit mode', () => {
    paramsMock = { id: 'recipe-1' }
    mockedUseRecipeDetail.mockReturnValue({ recipe: null, isLoading: true, error: null })
    renderRecipeEditor()

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })
})
