import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RetailerFilterBar from '@components/specials/RetailerFilterBar/RetailerFilterBar'
import { Retailer } from '@/types/retailers.types'

const retailers: Retailer[] = [
  { id: 'ret-1', name: 'Checkers', logoUrl: null },
  { id: 'ret-2', name: 'Pick n Pay', logoUrl: null },
]

describe('RetailerFilterBar Component', () => {
  it('renders an "All" chip and one chip per retailer', () => {
    render(<RetailerFilterBar retailers={retailers} selectedRetailerId={null} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Checkers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pick n Pay' })).toBeInTheDocument()
  })

  it('marks the selected retailer chip as pressed', () => {
    render(<RetailerFilterBar retailers={retailers} selectedRetailerId="ret-1" onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Checkers' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with the retailer id when a chip is clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(<RetailerFilterBar retailers={retailers} selectedRetailerId={null} onSelect={handleSelect} />)
    await user.click(screen.getByRole('button', { name: 'Pick n Pay' }))
    expect(handleSelect).toHaveBeenCalledWith('ret-2')
  })

  it('calls onSelect with null when the "All" chip is clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(<RetailerFilterBar retailers={retailers} selectedRetailerId="ret-1" onSelect={handleSelect} />)
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(handleSelect).toHaveBeenCalledWith(null)
  })
})
