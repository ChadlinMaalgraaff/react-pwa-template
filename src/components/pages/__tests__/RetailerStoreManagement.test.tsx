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
import RetailerStoreManagement from '@components/pages/RetailerStoreManagement/RetailerStoreManagement'
import { Retailer, Store } from '@/types/retailers.types'

vi.mock('@/services/retailers.service', () => ({
  default: {
    listRetailers: vi.fn(),
    createRetailer: vi.fn(),
    updateRetailer: vi.fn(),
    listStores: vi.fn(),
    createStore: vi.fn(),
    updateStore: vi.fn(),
    deleteStore: vi.fn(),
  },
}))

const mockedRetailersService = retailersService as unknown as Record<
  'listRetailers' | 'createRetailer' | 'updateRetailer' | 'listStores' | 'createStore' | 'updateStore' | 'deleteStore',
  ReturnType<typeof vi.fn>
>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderPage = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <RetailerStoreManagement />
      </MemoryRouter>
    </Provider>
  )

const retailers: Retailer[] = [
  { id: 'retailer-1', name: 'Checkers', logoUrl: null },
  { id: 'retailer-2', name: 'Pick n Pay', logoUrl: null },
]

const stores: Store[] = [
  { id: 'store-1', retailerId: 'retailer-1', retailerName: 'Checkers', branchName: 'Checkers Sandton', suburb: 'Sandton', city: 'Johannesburg' },
]

describe('RetailerStoreManagement Page', () => {
  beforeEach(() => {
    mockedRetailersService.listRetailers.mockResolvedValue(retailers)
    mockedRetailersService.listStores.mockResolvedValue(stores)
    mockedRetailersService.createRetailer.mockResolvedValue({ id: 'retailer-3', name: 'Woolworths', logoUrl: null })
    mockedRetailersService.updateRetailer.mockResolvedValue({ id: 'retailer-1', name: 'Checkers Updated', logoUrl: null })
    mockedRetailersService.createStore.mockResolvedValue({
      id: 'store-2',
      retailerId: 'retailer-1',
      retailerName: 'Checkers',
      branchName: 'Checkers Rosebank',
      suburb: 'Rosebank',
      city: 'Johannesburg',
    })
    mockedRetailersService.updateStore.mockResolvedValue({ ...stores[0], branchName: 'Checkers Sandton City' })
    mockedRetailersService.deleteStore.mockResolvedValue({ id: 'store-1', message: 'Deleted' })
  })

  it('renders the list of retailers', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())
    expect(screen.getByText('Pick n Pay')).toBeInTheDocument()
  })

  it('expands a retailer to show its stores', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.click(screen.getByText('Checkers'))

    await waitFor(() => expect(mockedRetailersService.listStores).toHaveBeenCalledWith({ retailerId: 'retailer-1' }))
    expect(await screen.findByText('Checkers Sandton')).toBeInTheDocument()
  })

  it('creates a new retailer via the form modal', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: '+ New Retailer' }))
    await user.type(screen.getByLabelText(/^Name/), 'Woolworths')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mockedRetailersService.createRetailer).toHaveBeenCalledWith({ name: 'Woolworths', logoUrl: undefined })
    )
  })

  it('adds a store for a retailer', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.click(screen.getAllByRole('button', { name: 'Add store' })[0])
    await user.type(screen.getByLabelText(/^Branch Name/), 'Checkers Rosebank')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(mockedRetailersService.createStore).toHaveBeenCalledWith({
        retailerId: 'retailer-1',
        branchName: 'Checkers Rosebank',
        suburb: undefined,
        city: undefined,
      })
    )
  })

  it('deletes a store after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Checkers')).toBeInTheDocument())

    await user.click(screen.getByText('Checkers'))
    await screen.findByText('Checkers Sandton')

    await user.click(screen.getByRole('button', { name: 'Delete row' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(mockedRetailersService.deleteStore).toHaveBeenCalledWith('store-1'))
  })
})
