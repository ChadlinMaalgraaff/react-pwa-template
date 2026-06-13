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
import IngredientCatalog from '@components/pages/IngredientCatalog/IngredientCatalog'
import { Ingredient } from '@/types/ingredients.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
    createIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
  },
}))

const mockedIngredientsService = ingredientsService as unknown as Record<
  'listIngredients' | 'createIngredient' | 'updateIngredient' | 'deleteIngredient',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderIngredientCatalog = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <IngredientCatalog />
      </MemoryRouter>
    </Provider>
  )

const ingredients: Ingredient[] = [
  { id: 'ing-1', name: 'Rice', category: 'Grains', defaultUnit: 'kg', aliases: ['white rice'] },
  { id: 'ing-2', name: 'Milk', category: 'Dairy', defaultUnit: 'L', aliases: [] },
]

describe('IngredientCatalog Page', () => {
  beforeEach(() => {
    mockedIngredientsService.listIngredients.mockResolvedValue(ingredients)
  })

  it('renders ingredient rows', async () => {
    renderIngredientCatalog()
    await waitFor(() => expect(screen.getByText('Rice')).toBeInTheDocument())
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('white rice')).toBeInTheDocument()
  })

  it('shows an empty state when there are no ingredients', async () => {
    mockedIngredientsService.listIngredients.mockResolvedValue([])
    renderIngredientCatalog()
    await waitFor(() => expect(screen.getByText('No ingredients yet.')).toBeInTheDocument())
  })

  it('creates a new ingredient via the form modal', async () => {
    mockedIngredientsService.createIngredient.mockResolvedValue({
      id: 'ing-3',
      name: 'Flour',
      category: 'Baking',
      defaultUnit: 'kg',
      aliases: [],
    })
    const user = userEvent.setup()
    renderIngredientCatalog()
    await waitFor(() => expect(screen.getByText('Rice')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Ingredient' }))
    expect(screen.getByRole('dialog', { name: 'New Ingredient' })).toBeInTheDocument()

    await user.type(screen.getByLabelText(/^Name/), 'Flour')
    await user.type(screen.getByLabelText(/^Default Unit/), 'kg')
    await user.type(screen.getByLabelText('Category'), 'Baking')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mockedIngredientsService.createIngredient).toHaveBeenCalledWith({
        name: 'Flour',
        category: 'Baking',
        defaultUnit: 'kg',
        aliases: [],
      })
    )
  })

  it('edits an existing ingredient', async () => {
    mockedIngredientsService.updateIngredient.mockResolvedValue({
      ...ingredients[0],
      defaultUnit: 'g',
    })
    const user = userEvent.setup()
    renderIngredientCatalog()
    await waitFor(() => expect(screen.getByText('Rice')).toBeInTheDocument())

    const editButtons = screen.getAllByRole('button', { name: 'Edit row' })
    await user.click(editButtons[0])

    expect(screen.getByRole('dialog', { name: 'Edit Ingredient' })).toBeInTheDocument()
    const unitInput = screen.getByLabelText(/^Default Unit/)
    await user.clear(unitInput)
    await user.type(unitInput, 'g')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mockedIngredientsService.updateIngredient).toHaveBeenCalledWith('ing-1', {
        name: 'Rice',
        category: 'Grains',
        defaultUnit: 'g',
        aliases: ['white rice'],
      })
    )
  })

  it('deletes an ingredient after confirmation', async () => {
    mockedIngredientsService.deleteIngredient.mockResolvedValue({ id: 'ing-2', message: 'Deleted' })
    const user = userEvent.setup()
    renderIngredientCatalog()
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument())

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete row' })
    await user.click(deleteButtons[1])

    expect(screen.getByRole('dialog', { name: 'Delete Ingredient' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedIngredientsService.deleteIngredient).toHaveBeenCalledWith('ing-2'))
  })
})
