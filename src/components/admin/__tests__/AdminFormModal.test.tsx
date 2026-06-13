import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminFormModal from '@components/admin/AdminFormModal/AdminFormModal'

describe('AdminFormModal Component', () => {
  it('renders nothing when closed', () => {
    render(
      <AdminFormModal isOpen={false} title="New Ingredient" onClose={vi.fn()} onSave={vi.fn()}>
        <p>Form fields</p>
      </AdminFormModal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the title and form content when open', () => {
    render(
      <AdminFormModal isOpen title="New Ingredient" onClose={vi.fn()} onSave={vi.fn()}>
        <p>Form fields</p>
      </AdminFormModal>
    )
    expect(screen.getByText('New Ingredient')).toBeInTheDocument()
    expect(screen.getByText('Form fields')).toBeInTheDocument()
  })

  it('calls onSave and onClose', async () => {
    const user = userEvent.setup()
    const handleSave = vi.fn()
    const handleClose = vi.fn()
    render(
      <AdminFormModal isOpen title="New Ingredient" onClose={handleClose} onSave={handleSave}>
        <p>Form fields</p>
      </AdminFormModal>
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(handleSave).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('disables buttons while saving', () => {
    render(
      <AdminFormModal isOpen title="New Ingredient" onClose={vi.fn()} onSave={vi.fn()} isSaving>
        <p>Form fields</p>
      </AdminFormModal>
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})
