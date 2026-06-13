import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Spinner from '@components/shared/Spinner/Spinner'

describe('Spinner Component', () => {
  it('renders a status indicator', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('renders full-screen wrapper when fullScreen is true', () => {
    const { container } = render(<Spinner fullScreen />)
    expect(container.querySelector('.h-full')).toBeInTheDocument()
  })

  it('applies the requested size', () => {
    render(<Spinner size="lg" />)
    expect(screen.getByRole('status')).toHaveClass('h-12', 'w-12')
  })
})
