import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import { useRecipeAdmin } from '@hooks/useRecipeAdmin'
import RecipeImport from '@components/pages/RecipeImport/RecipeImport'
import { RecipeDetail } from '@/types/recipes.types'

vi.mock('@hooks/useRecipeAdmin')

const mockedUseRecipeAdmin = useRecipeAdmin as unknown as ReturnType<typeof vi.fn>
const importRecipeMock = vi.fn()

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderRecipeImport = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RecipeImport />
      </MemoryRouter>
    </Provider>
  )

const importedRecipe: RecipeDetail = {
  id: 'recipe-1',
  title: 'Chicken Curry',
  description: 'A mild curry.',
  instructions: ['Chop the onions', 'Simmer the curry'],
  imageUrl: null,
  cuisine: 'Indian',
  prepTimeMinutes: 15,
  cookTimeMinutes: 30,
  servings: 4,
  isSaStaple: false,
  ingredients: [
    { ingredientId: 'ing-1', name: 'Chicken', quantity: 500, unit: 'g', isOptional: false, notes: null, inPantry: false },
  ],
  imageAuthor: null,
  imageLicense: null,
  imageSourceUrl: null,
  sourceName: null,
  sourceUrl: null,
  sourceLicense: null,
  source: null,
}

describe('RecipeImport Page', () => {
  beforeEach(() => {
    importRecipeMock.mockClear()
    mockedUseRecipeAdmin.mockReturnValue({ importRecipe: importRecipeMock, isSaving: false, error: null })
  })

  it('shows a validation error when importing without an ID', async () => {
    const user = userEvent.setup()
    renderRecipeImport()

    await user.click(screen.getByRole('button', { name: 'Import' }))

    expect(screen.getByText('TheMealDB Recipe ID is required.')).toBeInTheDocument()
    expect(importRecipeMock).not.toHaveBeenCalled()
  })

  it('imports a recipe and shows a preview', async () => {
    importRecipeMock.mockResolvedValue(importedRecipe)
    const user = userEvent.setup()
    renderRecipeImport()

    await user.type(screen.getByLabelText('TheMealDB Recipe ID'), '52772')
    await user.click(screen.getByRole('button', { name: 'Import' }))

    await waitFor(() => expect(importRecipeMock).toHaveBeenCalledWith('52772'))
    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()
    expect(screen.getByText('Chop the onions')).toBeInTheDocument()
    expect(screen.getByText(/500 g Chicken/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View in Recipe Editor' })).toHaveAttribute(
      'href',
      '/admin/recipes/recipe-1/edit'
    )
  })

  it('resets the form when "Import another" is clicked', async () => {
    importRecipeMock.mockResolvedValue(importedRecipe)
    const user = userEvent.setup()
    renderRecipeImport()

    await user.type(screen.getByLabelText('TheMealDB Recipe ID'), '52772')
    await user.click(screen.getByRole('button', { name: 'Import' }))
    await waitFor(() => expect(screen.getByText('Chicken Curry')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Import another' }))

    expect(screen.queryByText('Chicken Curry')).not.toBeInTheDocument()
    expect(screen.getByLabelText('TheMealDB Recipe ID')).toHaveValue('')
  })
})
