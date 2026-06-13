import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import RecipeIngredientFormRow, {
  RecipeIngredientFormValue,
} from '@components/admin/RecipeIngredientFormRow/RecipeIngredientFormRow'
import { Ingredient } from '@/types/ingredients.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
    createIngredient: vi.fn(),
    updateIngredient: vi.fn(),
    deleteIngredient: vi.fn(),
  },
}))

const mockedService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const ingredients: Ingredient[] = [
  { id: 'ing-1', name: 'Rice', category: 'Grains', defaultUnit: 'kg', aliases: [] },
]

const selectedValue: RecipeIngredientFormValue = {
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  quantity: 2,
  unit: 'kg',
  isOptional: false,
  notes: '',
}

describe('RecipeIngredientFormRow Component', () => {
  beforeEach(() => {
    mockedService.listIngredients.mockResolvedValue([])
  })

  it('shows the ingredient autocomplete when no ingredient is selected', () => {
    render(
      <Provider store={buildStore()}>
        <RecipeIngredientFormRow
          value={{ ingredientName: '', quantity: 1, unit: '', isOptional: false, notes: '' }}
          onChange={vi.fn()}
          onRemove={vi.fn()}
        />
      </Provider>
    )
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  it('shows the selected ingredient name and form fields', () => {
    render(
      <Provider store={buildStore()}>
        <RecipeIngredientFormRow value={selectedValue} onChange={vi.fn()} onRemove={vi.fn()} />
      </Provider>
    )
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toHaveValue(2)
    expect(screen.getByLabelText('Unit')).toHaveValue('kg')
  })

  it('calls onChange when the quantity changes', () => {
    const handleChange = vi.fn()
    render(
      <Provider store={buildStore()}>
        <RecipeIngredientFormRow value={selectedValue} onChange={handleChange} onRemove={vi.fn()} />
      </Provider>
    )
    const quantityInput = screen.getByLabelText('Quantity')
    fireEvent.change(quantityInput, { target: { value: '5' } })
    expect(handleChange).toHaveBeenCalledWith({ ...selectedValue, quantity: 5 })
  })

  it('selects an ingredient from the autocomplete', async () => {
    mockedService.listIngredients.mockResolvedValue(ingredients)
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(
      <Provider store={buildStore()}>
        <RecipeIngredientFormRow
          value={{ ingredientName: '', quantity: 1, unit: '', isOptional: false, notes: '' }}
          onChange={handleChange}
          onRemove={vi.fn()}
        />
      </Provider>
    )

    await user.type(screen.getByRole('searchbox'), 'Rice')
    await waitFor(() => screen.getByText('Rice'), { timeout: 2000 })
    await user.click(screen.getByText('Rice'))

    expect(handleChange).toHaveBeenCalledWith({
      ingredientName: 'Rice',
      quantity: 1,
      unit: 'kg',
      isOptional: false,
      notes: '',
      ingredientId: 'ing-1',
    })
  })

  it('calls onRemove when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(
      <Provider store={buildStore()}>
        <RecipeIngredientFormRow value={selectedValue} onChange={vi.fn()} onRemove={handleRemove} />
      </Provider>
    )
    await user.click(screen.getByRole('button', { name: 'Remove ingredient' }))
    expect(handleRemove).toHaveBeenCalled()
  })
})
