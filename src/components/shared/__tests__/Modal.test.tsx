import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@components/shared/Modal/Modal'

describe('Modal Component', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Edit Item">
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title and content when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Edit Item">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Edit Item')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Edit Item">
        <p>Content</p>
      </Modal>
    )

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Edit Item">
        <p>Content</p>
      </Modal>
    )

    await user.keyboard('{Escape}')
    expect(handleClose).toHaveBeenCalled()
  })
})
