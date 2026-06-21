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
import Pantry from '@components/pages/Pantry/Pantry'
import { PantryItem } from '@/types/pantry.types'
import { usePantry } from '@hooks/usePantry'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

vi.mock('@hooks/usePantry')

const mockedUsePantry = usePantry as unknown as ReturnType<typeof vi.fn>
const mockedIngredientsService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const items: PantryItem[] = [
  { id: 'item-1', ingredientId: 'ing-1', ingredientName: 'Rice', category: 'Grains', quantity: 2, unit: 'kg', source: 'manual', addedAt: '2026-01-01T00:00:00Z' },
  { id: 'item-2', ingredientId: 'ing-2', ingredientName: 'Salt', category: 'Spices', quantity: 1, unit: 'kg', source: 'manual', addedAt: '2026-01-01T00:00:00Z' },
]

const renderPantry = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Pantry />
      </MemoryRouter>
    </Provider>
  )

describe('Pantry Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedIngredientsService.listIngredients.mockResolvedValue([])
  })

  it('shows a spinner while loading', () => {
    mockedUsePantry.mockReturnValue({ items: [], isLoading: true, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    renderPantry()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('shows an empty state when there are no items', () => {
    mockedUsePantry.mockReturnValue({ items: [], isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    renderPantry()
    expect(screen.getByText("Let's stock your pantry")).toBeInTheDocument()
  })

  it('shows Scan Pantry and Add Manually buttons on empty state', async () => {
    mockedUsePantry.mockReturnValue({ items: [], isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    const user = userEvent.setup()
    renderPantry()
    expect(screen.getByRole('button', { name: /scan pantry/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /scan pantry/i }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry/capture')
  })

  it('renders pantry items grouped by category', () => {
    mockedUsePantry.mockReturnValue({ items, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    renderPantry()
    expect(screen.getByRole('heading', { name: 'Grains' })).toBeInTheDocument()
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Spices' })).toBeInTheDocument()
    expect(screen.getByText('Salt')).toBeInTheDocument()
  })

  it('navigates to the photo capture screen when the FAB is clicked', async () => {
    mockedUsePantry.mockReturnValue({ items, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    const user = userEvent.setup()
    renderPantry()
    await user.click(screen.getByRole('button', { name: 'Capture pantry photo' }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry/capture')
  })

  it('calls removeItem when the delete button for an item is clicked', async () => {
    const removeItem = vi.fn()
    mockedUsePantry.mockReturnValue({ items, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem, clearAll: vi.fn() })
    const user = userEvent.setup()
    renderPantry()
    await user.click(screen.getByRole('button', { name: 'Delete Rice' }))
    expect(removeItem).toHaveBeenCalledWith('item-1')
  })

  it('adds a new item via the Add Item sheet and keeps the sheet open', async () => {
    mockedIngredientsService.listIngredients.mockResolvedValue([
      { id: 'ing-3', name: 'Flour', category: 'Baking', defaultUnit: 'kg', aliases: [] },
    ])
    const addItem = vi.fn().mockResolvedValue([])
    mockedUsePantry.mockReturnValue({ items: [], isLoading: false, addItem, updateItem: vi.fn(), removeItem: vi.fn(), clearAll: vi.fn() })
    const user = userEvent.setup()
    renderPantry()

    await user.click(screen.getByRole('button', { name: 'Add item' }))
    await user.type(screen.getByRole('searchbox'), 'Flour')
    await waitFor(() => screen.getByText('Flour'), { timeout: 2000 })
    await user.click(screen.getByText('Flour'))
    await user.click(screen.getByRole('button', { name: 'Add to pantry' }))

    await waitFor(() =>
      expect(addItem).toHaveBeenCalledWith({ ingredientId: 'ing-3', quantity: 1, unit: 'kg' })
    )
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
  })

  it('opens clear pantry confirmation and calls clearAll on confirm', async () => {
    const clearAll = vi.fn().mockResolvedValue(undefined)
    mockedUsePantry.mockReturnValue({ items, isLoading: false, addItem: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn(), clearAll })
    const user = userEvent.setup()
    renderPantry()

    await user.click(screen.getByRole('button', { name: 'Clear pantry' }))
    expect(screen.getByText('Clear your pantry?')).toBeInTheDocument()

    const clearBtns = screen.getAllByRole('button', { name: 'Clear pantry' })
    await user.click(clearBtns[clearBtns.length - 1])
    await waitFor(() => expect(clearAll).toHaveBeenCalled())
  })
})
