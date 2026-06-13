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
import ShoppingListDetail from '@components/pages/ShoppingListDetail/ShoppingListDetail'
import { useShoppingListDetail } from '@hooks/useShoppingListDetail'
import { ShoppingListDetail as ShoppingListDetailType } from '@/types/shopping-lists.types'

vi.mock('@hooks/useShoppingListDetail')

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

const mockedUseShoppingListDetail = useShoppingListDetail as unknown as ReturnType<typeof vi.fn>
const mockedIngredientsService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock, useParams: () => ({ id: 'list-1' }) }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderShoppingListDetail = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <ShoppingListDetail />
      </MemoryRouter>
    </Provider>
  )

const list: ShoppingListDetailType = {
  id: 'list-1',
  name: 'Weekly Groceries',
  createdAt: '2026-06-01T00:00:00Z',
  items: [
    {
      id: 'item-1',
      ingredientId: 'ing-1',
      ingredientName: 'Mince',
      recipeId: 'recipe-1',
      recipeTitle: 'Bobotie',
      quantity: 500,
      unit: 'g',
      isChecked: false,
    },
    {
      id: 'item-2',
      ingredientId: 'ing-2',
      ingredientName: 'Milk',
      recipeId: null,
      recipeTitle: null,
      quantity: 1,
      unit: 'L',
      isChecked: true,
    },
  ],
}

describe('ShoppingListDetail Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedIngredientsService.listIngredients.mockResolvedValue([])
  })

  it('shows a spinner while loading', () => {
    mockedUseShoppingListDetail.mockReturnValue({
      list: null,
      isLoading: true,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    renderShoppingListDetail()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('redirects to the shopping lists page on error', async () => {
    mockedUseShoppingListDetail.mockReturnValue({
      list: null,
      isLoading: false,
      error: 'Not found',
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    renderShoppingListDetail()
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/shopping-lists'))
  })

  it('renders items grouped by recipe', () => {
    mockedUseShoppingListDetail.mockReturnValue({
      list,
      isLoading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    renderShoppingListDetail()

    expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bobotie' })).toBeInTheDocument()
    expect(screen.getByText('Mince — 500 g')).toBeInTheDocument()
    expect(screen.getByText('Other items')).toBeInTheDocument()
    expect(screen.getByText('Milk — 1 L')).toBeInTheDocument()
  })

  it('toggles an item when its checkbox is clicked', async () => {
    const updateItem = vi.fn()
    mockedUseShoppingListDetail.mockReturnValue({
      list,
      isLoading: false,
      error: null,
      addItem: vi.fn(),
      updateItem,
      removeItem: vi.fn(),
    })
    const user = userEvent.setup()
    renderShoppingListDetail()

    await user.click(screen.getByLabelText('Mark Mince as checked'))

    expect(updateItem).toHaveBeenCalledWith('item-1', { isChecked: true })
  })

  it('removes an item when its delete button is clicked', async () => {
    const removeItem = vi.fn()
    mockedUseShoppingListDetail.mockReturnValue({
      list,
      isLoading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem,
    })
    const user = userEvent.setup()
    renderShoppingListDetail()

    await user.click(screen.getByLabelText('Delete Milk'))

    expect(removeItem).toHaveBeenCalledWith('item-2')
  })

  it('navigates back to the shopping lists page', async () => {
    mockedUseShoppingListDetail.mockReturnValue({
      list,
      isLoading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    const user = userEvent.setup()
    renderShoppingListDetail()

    await user.click(screen.getByLabelText('Back to shopping lists'))

    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists')
  })

  it('shows an empty state when the list has no items', () => {
    mockedUseShoppingListDetail.mockReturnValue({
      list: { ...list, items: [] },
      isLoading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    renderShoppingListDetail()

    expect(screen.getByText('This list is empty')).toBeInTheDocument()
  })

  it('adds a new item via the Add Item sheet', async () => {
    mockedIngredientsService.listIngredients.mockResolvedValue([
      { id: 'ing-3', name: 'Flour', category: 'Baking', defaultUnit: 'kg', aliases: [] },
    ])
    const addItem = vi.fn().mockResolvedValue([])
    mockedUseShoppingListDetail.mockReturnValue({
      list,
      isLoading: false,
      error: null,
      addItem,
      updateItem: vi.fn(),
      removeItem: vi.fn(),
    })
    const user = userEvent.setup()
    renderShoppingListDetail()

    await user.click(screen.getByLabelText('Add item'))
    await user.type(screen.getByRole('searchbox'), 'Flour')
    await waitFor(() => screen.getByText('Flour'), { timeout: 2000 })
    await user.click(screen.getByText('Flour'))
    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(addItem).toHaveBeenCalledWith({ ingredientId: 'ing-3', quantity: 1, unit: 'kg' }))
  })
})
