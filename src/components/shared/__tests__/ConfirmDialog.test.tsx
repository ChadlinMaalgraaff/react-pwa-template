import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConfirmDialog from '@components/shared/ConfirmDialog/ConfirmDialog'

describe('ConfirmDialog Component', () => {
  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete item?"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title and message when open', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete item?"
        message="This cannot be undone."
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm and onCancel', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()
    const handleCancel = vi.fn()
    render(
      <ConfirmDialog
        isOpen
        title="Delete item?"
        message="This cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(handleConfirm).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handleCancel).toHaveBeenCalled()
  })

  it('disables buttons while loading', () => {
    render(
      <ConfirmDialog
        isOpen
        title="Delete item?"
        message="This cannot be undone."
        isLoading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})
