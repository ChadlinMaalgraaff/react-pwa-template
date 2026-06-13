import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import AdminRoute from '@components/shared/AdminRoute/AdminRoute'
import { UserProfile, UserRole } from '@/types/profile.types'

const buildUser = (role: UserRole): UserProfile => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role,
  preferredArea: null,
  dietaryPreferences: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const buildStore = (role: UserRole) =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
    preloadedState: {
      auth: {
        user: buildUser(role),
        token: 'token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      },
    },
  })

describe('AdminRoute Component', () => {
  it('renders the outlet for admin users', () => {
    render(
      <Provider store={buildStore('admin')}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>Admin dashboard</div>} />
            </Route>
            <Route path="/pantry" element={<div>Pantry content</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('Admin dashboard')).toBeInTheDocument()
  })

  it('redirects non-admin users to /pantry', () => {
    render(
      <Provider store={buildStore('user')}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<div>Admin dashboard</div>} />
            </Route>
            <Route path="/pantry" element={<div>Pantry content</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('Pantry content')).toBeInTheDocument()
  })
})
