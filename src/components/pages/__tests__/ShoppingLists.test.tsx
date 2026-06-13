import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import shoppingListsService from '@/services/shopping-lists.service'
import ShoppingLists from '@components/pages/ShoppingLists/ShoppingLists'
import { ShoppingListSummary } from '@/types/shopping-lists.types'

vi.mock('@/services/shopping-lists.service', () => ({
  default: {
    listShoppingLists: vi.fn(),
    createShoppingList: vi.fn(),
    deleteShoppingList: vi.fn(),
  },
}))

const mockedShoppingListsService = shoppingListsService as unknown as Record<
  'listShoppingLists' | 'createShoppingList' | 'deleteShoppingList',
  ReturnType<typeof vi.fn>
>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderShoppingLists = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <ShoppingLists />
      </MemoryRouter>
    </Provider>
  )

const lists: ShoppingListSummary[] = [
  { id: 'list-1', name: 'Weekly Groceries', itemCount: 3, createdAt: '2026-06-01T00:00:00Z' },
]

describe('ShoppingLists Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    mockedShoppingListsService.listShoppingLists.mockResolvedValue(lists)
  })

  it('renders existing shopping lists', async () => {
    renderShoppingLists()
    await waitFor(() => expect(screen.getByText('Weekly Groceries')).toBeInTheDocument())
    expect(screen.getByText(/3 items · Created/)).toBeInTheDocument()
  })

  it('shows an empty state with a create action when there are no lists', async () => {
    mockedShoppingListsService.listShoppingLists.mockResolvedValue([])
    mockedShoppingListsService.createShoppingList.mockResolvedValue({
      id: 'list-2',
      name: 'New List',
      items: [],
      createdAt: '2026-06-12T00:00:00Z',
    })
    const user = userEvent.setup()
    renderShoppingLists()

    await waitFor(() => expect(screen.getByText('No shopping lists yet')).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Create one' }))
    await user.type(screen.getByLabelText('Name'), 'New List')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(mockedShoppingListsService.createShoppingList).toHaveBeenCalledWith({ name: 'New List' }))
    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists/list-2')
  })

  it('navigates to the detail page when a list is clicked', async () => {
    const user = userEvent.setup()
    renderShoppingLists()
    await waitFor(() => expect(screen.getByText('Weekly Groceries')).toBeInTheDocument())

    await user.click(screen.getByText('Weekly Groceries'))

    expect(navigateMock).toHaveBeenCalledWith('/shopping-lists/list-1')
  })

  it('deletes a list when the delete button is clicked', async () => {
    mockedShoppingListsService.deleteShoppingList.mockResolvedValue({ id: 'list-1' })
    const user = userEvent.setup()
    renderShoppingLists()
    await waitFor(() => expect(screen.getByText('Weekly Groceries')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Delete Weekly Groceries' }))

    await waitFor(() => expect(mockedShoppingListsService.deleteShoppingList).toHaveBeenCalledWith('list-1'))
    await waitFor(() => expect(screen.queryByText('Weekly Groceries')).not.toBeInTheDocument())
  })
})
