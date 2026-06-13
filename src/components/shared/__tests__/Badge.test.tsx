import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '@components/shared/Badge/Badge'

describe('Badge Component', () => {
  it('renders its children', () => {
    render(<Badge>Makeable</Badge>)
    expect(screen.getByText('Makeable')).toBeInTheDocument()
  })

  it('applies the neutral variant by default', () => {
    render(<Badge>Admin</Badge>)
    expect(screen.getByText('Admin')).toHaveClass('bg-neutral-100')
  })

  it('applies the success variant', () => {
    render(<Badge variant="success">Makeable</Badge>)
    expect(screen.getByText('Makeable')).toHaveClass('bg-primary-light')
  })

  it('applies the danger variant', () => {
    render(<Badge variant="danger">Expired</Badge>)
    expect(screen.getByText('Expired')).toHaveClass('text-danger')
  })
})
