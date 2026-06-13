import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import specialsService from '@/services/specials.service'
import retailersService from '@/services/retailers.service'
import ingredientsService from '@/services/ingredients.service'
import SpecialsManagement from '@components/pages/SpecialsManagement/SpecialsManagement'
import { WeeklySpecial } from '@/types/specials.types'

vi.mock('@/services/specials.service', () => ({
  default: {
    listSpecials: vi.fn(),
    updateSpecial: vi.fn(),
    deleteSpecial: vi.fn(),
  },
}))

vi.mock('@/services/retailers.service', () => ({
  default: {
    listRetailers: vi.fn(),
  },
}))

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

const mockedSpecialsService = specialsService as unknown as Record<
  'listSpecials' | 'updateSpecial' | 'deleteSpecial',
  ReturnType<typeof vi.fn>
>
const mockedRetailersService = retailersService as unknown as Record<'listRetailers', ReturnType<typeof vi.fn>>
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

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <SpecialsManagement />
      </MemoryRouter>
    </Provider>
  )

const specials: WeeklySpecial[] = [
  {
    id: 'special-1',
    retailerId: 'retailer-1',
    retailerName: 'Checkers',
    storeId: null,
    ingredientId: 'ing-1',
    ingredientName: 'Mince',
    itemName: 'Beef Mince 500g',
    price: 59.99,
    unit: '500g',
    imageUrl: null,
    validFrom: '2026-06-01',
    validTo: '2026-06-07',
  },
  {
    id: 'special-2',
    retailerId: 'retailer-1',
    retailerName: 'Checkers',
    storeId: null,
    ingredientId: null,
    ingredientName: null,
    itemName: 'Mystery Item',
    price: 19.99,
    unit: null,
    imageUrl: null,
    validFrom: '2026-06-01',
    validTo: '2026-06-07',
  },
]

describe('SpecialsManagement Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedRetailersService.listRetailers.mockResolvedValue([{ id: 'retailer-1', name: 'Checkers', logoUrl: null }])
    mockedIngredientsService.listIngredients.mockResolvedValue([])
    mockedSpecialsService.listSpecials.mockResolvedValue({ items: specials, total: 2, page: 1, pageSize: 10 })
    mockedSpecialsService.updateSpecial.mockResolvedValue({ ...specials[1], ingredientId: 'ing-2', ingredientName: 'Chicken' })
    mockedSpecialsService.deleteSpecial.mockResolvedValue({ id: 'special-2', message: 'Deleted' })
  })

  it('renders specials with mapped and unmapped ingredient badges', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Beef Mince 500g')).toBeInTheDocument())
    expect(screen.getByText('Mince')).toBeInTheDocument()
    expect(screen.getByText('Unmapped')).toBeInTheDocument()
  })

  it('navigates to the specials upload page', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Beef Mince 500g')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Upload New Specials' }))
    expect(navigateMock).toHaveBeenCalledWith('/admin/specials/upload')
  })

  it('filters to unmapped specials only', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Beef Mince 500g')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Unmapped only' }))

    expect(screen.queryByText('Beef Mince 500g')).not.toBeInTheDocument()
    expect(screen.getByText('Mystery Item')).toBeInTheDocument()
  })

  it('deletes a special after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Mystery Item')).toBeInTheDocument())

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete row' })
    await user.click(deleteButtons[1])
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedSpecialsService.deleteSpecial).toHaveBeenCalledWith('special-2'))
    await waitFor(() => expect(screen.queryByText('Mystery Item')).not.toBeInTheDocument())
  })

  it('opens the ingredient autocomplete to map an unmapped special', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Unmapped')).toBeInTheDocument())

    await user.click(screen.getByText('Unmapped'))

    expect(screen.getByPlaceholderText('Search ingredients...')).toBeInTheDocument()
  })
})
