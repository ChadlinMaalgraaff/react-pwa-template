import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chip from '@components/shared/Chip/Chip'

describe('Chip Component', () => {
  it('renders its children', () => {
    render(<Chip>Checkers</Chip>)
    expect(screen.getByText('Checkers')).toBeInTheDocument()
  })

  it('renders as a button and calls onClick when clickable', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Chip onClick={handleClick}>Checkers</Chip>)

    await user.click(screen.getByRole('button', { name: 'Checkers' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('applies selected styling', () => {
    render(<Chip selected onClick={vi.fn()}>Vegetarian</Chip>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('renders a remove button when onRemove is provided', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<Chip onRemove={handleRemove}>Vegetarian</Chip>)

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(handleRemove).toHaveBeenCalled()
  })
})
