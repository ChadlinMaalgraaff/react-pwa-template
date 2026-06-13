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
import Specials from '@components/pages/Specials/Specials'
import { WeeklySpecial } from '@/types/specials.types'
import { Retailer } from '@/types/retailers.types'

vi.mock('@/services/specials.service', () => ({
  default: {
    listSpecials: vi.fn(),
  },
}))

vi.mock('@/services/retailers.service', () => ({
  default: {
    listRetailers: vi.fn(),
  },
}))

const mockedSpecialsService = specialsService as unknown as Record<'listSpecials', ReturnType<typeof vi.fn>>
const mockedRetailersService = retailersService as unknown as Record<'listRetailers', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderSpecials = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <Specials />
      </MemoryRouter>
    </Provider>
  )

const retailers: Retailer[] = [{ id: 'retailer-1', name: 'Checkers', logoUrl: null }]

const specials: WeeklySpecial[] = [
  {
    id: 'special-2',
    retailerId: 'retailer-1',
    retailerName: 'Checkers',
    storeId: null,
    ingredientId: 'ing-1',
    ingredientName: 'Rice',
    itemName: 'Rice 2kg',
    price: 39.99,
    unit: '2kg',
    imageUrl: null,
    validFrom: '2026-06-01T00:00:00Z',
    validTo: '2026-06-30T00:00:00Z',
  },
  {
    id: 'special-1',
    retailerId: 'retailer-1',
    retailerName: 'Checkers',
    storeId: null,
    ingredientId: 'ing-2',
    ingredientName: 'Bread',
    itemName: 'White Bread',
    price: 19.99,
    unit: 'loaf',
    imageUrl: null,
    validFrom: '2026-06-01T00:00:00Z',
    validTo: '2026-06-15T00:00:00Z',
  },
]

describe('Specials Page', () => {
  beforeEach(() => {
    mockedRetailersService.listRetailers.mockResolvedValue(retailers)
    mockedSpecialsService.listSpecials.mockResolvedValue({ items: specials, total: 2, page: 1, pageSize: 10 })
  })

  it('renders specials sorted by closest expiry first', async () => {
    renderSpecials()

    await waitFor(() => expect(screen.getByText('White Bread')).toBeInTheDocument())
    const names = screen.getAllByText(/Bread|Rice 2kg/)
    expect(names[0]).toHaveTextContent('White Bread')
    expect(names[1]).toHaveTextContent('Rice 2kg')
  })

  it('shows an empty state when no specials match', async () => {
    mockedSpecialsService.listSpecials.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 10 })
    renderSpecials()

    await waitFor(() => expect(screen.getByText('No specials match your search')).toBeInTheDocument())
  })

  it('filters by retailer chip', async () => {
    const user = userEvent.setup()
    renderSpecials()
    await waitFor(() => expect(screen.getByText('White Bread')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Checkers' }))

    await waitFor(() =>
      expect(mockedSpecialsService.listSpecials).toHaveBeenLastCalledWith({
        active: true,
        page: 1,
        pageSize: 10,
        retailerId: 'retailer-1',
      })
    )
  })

  it('searches specials by name', async () => {
    const user = userEvent.setup()
    renderSpecials()
    await waitFor(() => expect(screen.getByText('White Bread')).toBeInTheDocument())

    await user.type(screen.getByRole('searchbox'), 'Rice')

    await waitFor(() =>
      expect(mockedSpecialsService.listSpecials).toHaveBeenLastCalledWith({
        active: true,
        page: 1,
        pageSize: 10,
        search: 'Rice',
      })
    )
  })

  it('loads more specials when the load more button is clicked', async () => {
    mockedSpecialsService.listSpecials.mockResolvedValue({ items: specials, total: 5, page: 1, pageSize: 10 })
    const user = userEvent.setup()
    renderSpecials()
    await waitFor(() => expect(screen.getByText('White Bread')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Load more' }))

    await waitFor(() =>
      expect(mockedSpecialsService.listSpecials).toHaveBeenLastCalledWith({
        active: true,
        page: 1,
        pageSize: 20,
      })
    )
  })
})
