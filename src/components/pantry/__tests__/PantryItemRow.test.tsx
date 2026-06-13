import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PantryItemRow from '@components/pantry/PantryItemRow/PantryItemRow'
import { PantryItem } from '@/types/pantry.types'

const item: PantryItem = {
  id: 'item-1',
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  category: 'Grains',
  quantity: 2,
  unit: 'kg',
  source: 'manual',
  addedAt: '2026-01-01T00:00:00.000Z',
}

describe('PantryItemRow Component', () => {
  it('renders the ingredient name, category, and quantity', () => {
    render(<PantryItemRow item={item} onQuantityChange={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByText('Grains')).toBeInTheDocument()
    expect(screen.getByText('2 kg')).toBeInTheDocument()
  })

  it('calls onQuantityChange when the stepper is used', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<PantryItemRow item={item} onQuantityChange={handleChange} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(handleChange).toHaveBeenCalledWith('item-1', 3)
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    render(<PantryItemRow item={item} onQuantityChange={vi.fn()} onDelete={handleDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete Rice' }))
    expect(handleDelete).toHaveBeenCalledWith('item-1')
  })
})
