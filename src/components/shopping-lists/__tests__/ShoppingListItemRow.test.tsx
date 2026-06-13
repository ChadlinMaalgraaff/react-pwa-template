import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShoppingListItemRow from '@components/shopping-lists/ShoppingListItemRow/ShoppingListItemRow'
import { ShoppingListItem } from '@/types/shopping-lists.types'

const item: ShoppingListItem = {
  id: 'item-1',
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  recipeId: 'recipe-1',
  recipeTitle: 'Bobotie',
  quantity: 2,
  unit: 'kg',
  isChecked: false,
}

describe('ShoppingListItemRow Component', () => {
  it('renders the ingredient name, quantity, and recipe source tag', () => {
    render(<ShoppingListItemRow item={item} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Rice — 2 kg')).toBeInTheDocument()
    expect(screen.getByText('Bobotie')).toBeInTheDocument()
  })

  it('applies a checked style when isChecked is true', () => {
    render(<ShoppingListItemRow item={{ ...item, isChecked: true }} onToggle={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Rice — 2 kg').parentElement).toHaveClass('shopping-list-item-checked')
  })

  it('calls onToggle when the checkbox is clicked', async () => {
    const user = userEvent.setup()
    const handleToggle = vi.fn()
    render(<ShoppingListItemRow item={item} onToggle={handleToggle} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('checkbox'))
    expect(handleToggle).toHaveBeenCalledWith('item-1', true)
  })

  it('calls onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup()
    const handleDelete = vi.fn()
    render(<ShoppingListItemRow item={item} onToggle={vi.fn()} onDelete={handleDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete Rice' }))
    expect(handleDelete).toHaveBeenCalledWith('item-1')
  })
})
