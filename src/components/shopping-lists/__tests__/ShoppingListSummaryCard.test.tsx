import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShoppingListSummaryCard from '@components/shopping-lists/ShoppingListSummaryCard/ShoppingListSummaryCard'
import { ShoppingListSummary } from '@/types/shopping-lists.types'

const list: ShoppingListSummary = {
  id: 'list-1',
  name: 'Weekly Groceries',
  itemCount: 5,
  createdAt: '2026-06-01T00:00:00.000Z',
}

describe('ShoppingListSummaryCard Component', () => {
  it('renders the list name, item count, and created date', () => {
    render(<ShoppingListSummaryCard list={list} />)
    expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
    expect(screen.getByText(/5 items/)).toBeInTheDocument()
    expect(screen.getByText(/Created/)).toBeInTheDocument()
  })

  it('uses singular "item" for a single item', () => {
    render(<ShoppingListSummaryCard list={{ ...list, itemCount: 1 }} />)
    expect(screen.getByText(/1 item ·/)).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<ShoppingListSummaryCard list={list} onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
