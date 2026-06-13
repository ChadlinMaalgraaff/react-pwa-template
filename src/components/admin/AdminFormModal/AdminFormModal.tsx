import React from 'react'
import { Modal, Button } from '@components/shared'
import './AdminFormModal.css'

interface AdminFormModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  onSave: () => void
  isSaving?: boolean
  saveLabel?: string
  cancelLabel?: string
  children: React.ReactNode
}

const AdminFormModal = ({
  isOpen,
  title,
  onClose,
  onSave,
  isSaving = false,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  children,
}: AdminFormModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="admin-form-modal-body">{children}</div>
    <div className="admin-form-modal-footer">
      <Button variant="secondary" onClick={onClose} disabled={isSaving}>
        {cancelLabel}
      </Button>
      <Button variant="primary" onClick={onSave} isLoading={isSaving}>
        {saveLabel}
      </Button>
    </div>
  </Modal>
)

export default AdminFormModal
