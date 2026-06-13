import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import Sidebar from '@components/layout/Sidebar/Sidebar'

const buildStore = (sidebarOpen: boolean) =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
    preloadedState: {
      ui: {
        isLoading: false,
        notification: null,
        theme: 'light' as const,
        sidebarOpen,
      },
    },
  })

describe('Sidebar Component', () => {
  it('renders the admin navigation links', () => {
    render(
      <Provider store={buildStore(true)}>
        <MemoryRouter initialEntries={['/admin']}>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin')
    expect(screen.getByRole('link', { name: /catalog/i })).toHaveAttribute('href', '/admin/ingredients')
    expect(screen.getByRole('link', { name: /recipes/i })).toHaveAttribute('href', '/admin/recipes')
    expect(screen.getByRole('link', { name: /retailers/i })).toHaveAttribute('href', '/admin/retailers')
    expect(screen.getByRole('link', { name: /specials/i })).toHaveAttribute('href', '/admin/specials')
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute('href', '/admin/users')
  })

  it('renders nothing when the sidebar is closed', () => {
    render(
      <Provider store={buildStore(false)}>
        <MemoryRouter initialEntries={['/admin']}>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    )
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
