import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import IngredientAutocomplete from '@components/pantry/IngredientAutocomplete/IngredientAutocomplete'
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

describe('IngredientAutocomplete Component', () => {
  beforeEach(() => {
    mockedService.listIngredients.mockResolvedValue([])
  })

  it('shows matching ingredients after searching', async () => {
    mockedService.listIngredients.mockResolvedValue(ingredients)
    const user = userEvent.setup()
    render(
      <Provider store={buildStore()}>
        <IngredientAutocomplete onSelect={vi.fn()} />
      </Provider>
    )

    await user.type(screen.getByRole('searchbox'), 'Rice')

    await waitFor(() => expect(screen.getByText('Rice')).toBeInTheDocument(), { timeout: 2000 })
  })

  it('offers to add a new ingredient when there is no exact match', async () => {
    mockedService.listIngredients.mockResolvedValue([])
    const user = userEvent.setup()
    render(
      <Provider store={buildStore()}>
        <IngredientAutocomplete onSelect={vi.fn()} />
      </Provider>
    )

    await user.type(screen.getByRole('searchbox'), 'Quinoa')

    await waitFor(
      () => expect(screen.getByText('Add "Quinoa" as new ingredient')).toBeInTheDocument(),
      { timeout: 2000 }
    )
  })

  it('calls onSelect with the chosen ingredient', async () => {
    mockedService.listIngredients.mockResolvedValue(ingredients)
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(
      <Provider store={buildStore()}>
        <IngredientAutocomplete onSelect={handleSelect} />
      </Provider>
    )

    await user.type(screen.getByRole('searchbox'), 'Rice')

    await waitFor(() => screen.getByText('Rice'), { timeout: 2000 })
    await user.click(screen.getByText('Rice'))
    expect(handleSelect).toHaveBeenCalledWith(ingredients[0])
  })
})
