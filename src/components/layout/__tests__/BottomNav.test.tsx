import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BottomNav from '@components/layout/BottomNav/BottomNav'

describe('BottomNav Component', () => {
  it('renders all 3 tabs', () => {
    render(
      <MemoryRouter initialEntries={['/pantry']}>
        <BottomNav />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /pantry/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /recipes/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /specials/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /lists/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
  })

  it('marks the active tab based on the current route', () => {
    render(
      <MemoryRouter initialEntries={['/recipes']}>
        <BottomNav />
      </MemoryRouter>
    )
    expect(screen.getByRole('link', { name: /recipes/i })).toHaveClass('bottom-nav-link-active')
    expect(screen.getByRole('link', { name: /pantry/i })).not.toHaveClass('bottom-nav-link-active')
  })
})
