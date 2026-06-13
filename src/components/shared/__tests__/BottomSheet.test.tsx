import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomSheet from '@components/shared/BottomSheet/BottomSheet'

describe('BottomSheet Component', () => {
  it('renders nothing when closed', () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()} title="Add Item">
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title and content when open', () => {
    render(
      <BottomSheet isOpen onClose={vi.fn()} title="Add Item">
        <p>Content</p>
      </BottomSheet>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <BottomSheet isOpen onClose={handleClose} title="Add Item">
        <p>Content</p>
      </BottomSheet>
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })
})
