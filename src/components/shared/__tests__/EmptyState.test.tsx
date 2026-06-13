import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmptyState from '@components/shared/EmptyState/EmptyState'

describe('EmptyState Component', () => {
  it('renders the title and message', () => {
    render(<EmptyState title="Your pantry is empty" message="Add items to get started." />)
    expect(screen.getByText('Your pantry is empty')).toBeInTheDocument()
    expect(screen.getByText('Add items to get started.')).toBeInTheDocument()
  })

  it('renders an action button and calls onAction when clicked', async () => {
    const user = userEvent.setup()
    const handleAction = vi.fn()
    render(<EmptyState title="No recipes match yet" actionLabel="Add ingredients" onAction={handleAction} />)

    await user.click(screen.getByRole('button', { name: 'Add ingredients' }))
    expect(handleAction).toHaveBeenCalled()
  })

  it('does not render an action button when no handler is provided', () => {
    render(<EmptyState title="No specials right now" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
