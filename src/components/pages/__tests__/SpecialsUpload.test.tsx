import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import retailersService from '@/services/retailers.service'
import specialsService from '@/services/specials.service'
import ingredientsService from '@/services/ingredients.service'
import SpecialsUpload from '@components/pages/SpecialsUpload/SpecialsUpload'

vi.mock('@/services/retailers.service', () => ({
  default: {
    listRetailers: vi.fn(),
    listStores: vi.fn(),
  },
}))

vi.mock('@/services/specials.service', () => ({
  default: {
    createSpecials: vi.fn(),
  },
}))

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

const mockedRetailersService = retailersService as unknown as Record<
  'listRetailers' | 'listStores',
  ReturnType<typeof vi.fn>
>
const mockedSpecialsService = specialsService as unknown as Record<'createSpecials', ReturnType<typeof vi.fn>>
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
        <SpecialsUpload />
      </MemoryRouter>
    </Provider>
  )

describe('SpecialsUpload Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedRetailersService.listRetailers.mockResolvedValue([{ id: 'retailer-1', name: 'Checkers', logoUrl: null }])
    mockedRetailersService.listStores.mockResolvedValue([
      { id: 'store-1', retailerId: 'retailer-1', retailerName: 'Checkers', branchName: 'Checkers Sandton', suburb: 'Sandton', city: 'Johannesburg' },
    ])
    mockedIngredientsService.listIngredients.mockResolvedValue([])
    mockedSpecialsService.createSpecials.mockResolvedValue({ items: [], message: '1 specials uploaded, 1 unmapped' })
  })

  it('shows a validation error when no retailer is selected', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.type(screen.getByLabelText('Item name'), 'Beef Mince 500g')
    await user.clear(screen.getByLabelText('Price'))
    await user.type(screen.getByLabelText('Price'), '59.99')
    await user.click(screen.getByRole('button', { name: /Upload \d Special/ }))

    expect(screen.getByText('Please select a retailer.')).toBeInTheDocument()
    expect(mockedSpecialsService.createSpecials).not.toHaveBeenCalled()
  })

  it('shows a validation error when no valid items exist', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText('Retailer'), 'retailer-1')
    await user.click(screen.getByRole('button', { name: /Upload \d Special/ }))

    expect(screen.getByText('Add at least one item with a name and price.')).toBeInTheDocument()
    expect(mockedSpecialsService.createSpecials).not.toHaveBeenCalled()
  })

  it('uploads specials and navigates to the specials list', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.selectOptions(screen.getByLabelText('Retailer'), 'retailer-1')
    await user.type(screen.getByLabelText('Item name'), 'Beef Mince 500g')
    await user.clear(screen.getByLabelText('Price'))
    await user.type(screen.getByLabelText('Price'), '59.99')

    await user.click(screen.getByRole('button', { name: /Upload \d Special/ }))

    await waitFor(() =>
      expect(mockedSpecialsService.createSpecials).toHaveBeenCalledWith(
        expect.objectContaining({
          retailerId: 'retailer-1',
          items: [expect.objectContaining({ itemName: 'Beef Mince 500g', price: 59.99 })],
        })
      )
    )
    expect(navigateMock).toHaveBeenCalledWith('/admin/specials')
  })

  it('adds an additional item row', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    expect(screen.getAllByLabelText('Item name')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: 'Add Item' }))
    expect(screen.getAllByLabelText('Item name')).toHaveLength(2)
  })
})
