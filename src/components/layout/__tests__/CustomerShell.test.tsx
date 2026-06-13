import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CustomerShell from '@components/layout/CustomerShell/CustomerShell'
import { getScreenTitle } from '@components/layout/CustomerShell/screenTitles'

describe('CustomerShell Component', () => {
  it('renders the screen title for the current route', () => {
    render(
      <MemoryRouter initialEntries={['/pantry']}>
        <Routes>
          <Route element={<CustomerShell />}>
            <Route path="/pantry" element={<div>Pantry content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { name: 'Pantry' })).toBeInTheDocument()
    expect(screen.getByText('Pantry content')).toBeInTheDocument()
  })

  it('renders the bottom navigation', () => {
    render(
      <MemoryRouter initialEntries={['/pantry']}>
        <Routes>
          <Route element={<CustomerShell />}>
            <Route path="/pantry" element={<div>Pantry content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
  })
})

describe('getScreenTitle', () => {
  it('returns mapped titles for known routes', () => {
    expect(getScreenTitle('/pantry')).toBe('Pantry')
    expect(getScreenTitle('/recipes')).toBe('Recipes')
    expect(getScreenTitle('/recipes/browse')).toBe('Recipes')
    expect(getScreenTitle('/specials')).toBe('Specials')
    expect(getScreenTitle('/shopping-lists')).toBe('Shopping Lists')
    expect(getScreenTitle('/profile')).toBe('Profile & Settings')
  })

  it('returns a fallback title for dynamic detail routes', () => {
    expect(getScreenTitle('/recipes/abc-123')).toBe('Recipe Detail')
    expect(getScreenTitle('/shopping-lists/abc-123')).toBe('Shopping List')
  })

  it('returns a default title for unknown routes', () => {
    expect(getScreenTitle('/unknown')).toBe('PantryPal')
  })
})
