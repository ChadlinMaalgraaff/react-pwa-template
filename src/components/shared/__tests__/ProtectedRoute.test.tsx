import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ProtectedRoute from '@components/shared/ProtectedRoute/ProtectedRoute'

const buildStore = (isAuthenticated: boolean) =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
    preloadedState: {
      auth: {
        user: null,
        token: isAuthenticated ? 'token' : null,
        isAuthenticated,
        isLoading: false,
        error: null,
      },
    },
  })

describe('ProtectedRoute Component', () => {
  it('renders the outlet when authenticated', () => {
    render(
      <Provider store={buildStore(true)}>
        <MemoryRouter initialEntries={['/pantry']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/pantry" element={<div>Pantry content</div>} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('Pantry content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    render(
      <Provider store={buildStore(false)}>
        <MemoryRouter initialEntries={['/pantry']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/pantry" element={<div>Pantry content</div>} />
            </Route>
            <Route path="/login" element={<div>Login page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
