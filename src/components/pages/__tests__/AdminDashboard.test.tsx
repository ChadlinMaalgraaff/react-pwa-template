import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import recipesService from '@/services/recipes.service'
import specialsService from '@/services/specials.service'
import adminUsersService from '@/services/admin-users.service'
import AdminDashboard from '@components/pages/AdminDashboard/AdminDashboard'

vi.mock('@/services/ingredients.service', () => ({ default: { listIngredients: vi.fn() } }))
vi.mock('@/services/recipes.service', () => ({ default: { listRecipes: vi.fn() } }))
vi.mock('@/services/specials.service', () => ({ default: { listSpecials: vi.fn() } }))
vi.mock('@/services/admin-users.service', () => ({ default: { listUsers: vi.fn() } }))

const mockedIngredientsService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>
const mockedRecipesService = recipesService as unknown as Record<'listRecipes', ReturnType<typeof vi.fn>>
const mockedSpecialsService = specialsService as unknown as Record<'listSpecials', ReturnType<typeof vi.fn>>
const mockedAdminUsersService = adminUsersService as unknown as Record<'listUsers', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderAdminDashboard = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </Provider>
  )

describe('AdminDashboard Page', () => {
  beforeEach(() => {
    mockedIngredientsService.listIngredients.mockResolvedValue([{ id: 'ing-1', name: 'Rice', category: null, defaultUnit: 'kg', aliases: [] }])
    mockedRecipesService.listRecipes.mockResolvedValue({ items: [], total: 12, page: 1, pageSize: 1 })
    mockedSpecialsService.listSpecials.mockResolvedValue({ items: [], total: 7, page: 1, pageSize: 1 })
    mockedAdminUsersService.listUsers.mockResolvedValue({ items: [], total: 3, page: 1, pageSize: 1 })
  })

  it('renders summary counts for each section', async () => {
    renderAdminDashboard()

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
    expect(screen.getByText('Total Ingredients')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Total Recipes')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Active Specials')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('links each card to its admin section', async () => {
    renderAdminDashboard()
    await waitFor(() => expect(screen.getByText('Total Ingredients')).toBeInTheDocument())

    expect(screen.getByText('Total Ingredients').closest('a')).toHaveAttribute('href', '/admin/ingredients')
    expect(screen.getByText('Total Recipes').closest('a')).toHaveAttribute('href', '/admin/recipes')
    expect(screen.getByText('Active Specials').closest('a')).toHaveAttribute('href', '/admin/specials')
    expect(screen.getByText('Total Users').closest('a')).toHaveAttribute('href', '/admin/users')
  })
})
