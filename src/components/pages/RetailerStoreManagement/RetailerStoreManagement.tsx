import { useState } from 'react'
import { Edit2, Plus } from 'lucide-react'
import { Button, Card, EmptyState, Spinner, Input, ConfirmDialog } from '@components/shared'
import { AdminFormModal, DataTable, DataTableColumn } from '@components/admin'
import { useRetailers } from '@hooks/useRetailers'
import { useStores } from '@hooks/useStores'
import { Retailer, Store } from '@/types/retailers.types'
import './RetailerStoreManagement.css'

interface RetailerFormState {
  name: string
  logoUrl: string
}

interface StoreFormState {
  branchName: string
  suburb: string
  city: string
}

const emptyRetailerForm: RetailerFormState = { name: '', logoUrl: '' }
const emptyStoreForm: StoreFormState = { branchName: '', suburb: '', city: '' }

const RetailerStoreManagement = () => {
  const { retailers, isLoading, createRetailer, updateRetailer } = useRetailers()
  const { stores, isLoading: storesLoading, fetchStoresForRetailer, createStore, updateStore, deleteStore } =
    useStores()

  const [expandedRetailerId, setExpandedRetailerId] = useState<string | null>(null)
  const [editingRetailer, setEditingRetailer] = useState<Retailer | null>(null)
  const [isCreatingRetailer, setIsCreatingRetailer] = useState(false)
  const [retailerForm, setRetailerForm] = useState<RetailerFormState>(emptyRetailerForm)
  const [isSavingRetailer, setIsSavingRetailer] = useState(false)

  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [addingStoreForRetailerId, setAddingStoreForRetailerId] = useState<string | null>(null)
  const [storeForm, setStoreForm] = useState<StoreFormState>(emptyStoreForm)
  const [isSavingStore, setIsSavingStore] = useState(false)
  const [deletingStore, setDeletingStore] = useState<Store | null>(null)
  const [isDeletingStore, setIsDeletingStore] = useState(false)

  const toggleExpanded = async (retailerId: string) => {
    if (expandedRetailerId === retailerId) {
      setExpandedRetailerId(null)
      return
    }
    setExpandedRetailerId(retailerId)
    try {
      await fetchStoresForRetailer(retailerId)
    } catch {
      // error notification already dispatched by useStores
    }
  }

  const openCreateRetailerForm = () => {
    setRetailerForm(emptyRetailerForm)
    setIsCreatingRetailer(true)
  }

  const openEditRetailerForm = (retailer: Retailer) => {
    setRetailerForm({ name: retailer.name, logoUrl: retailer.logoUrl ?? '' })
    setEditingRetailer(retailer)
  }

  const closeRetailerForm = () => {
    setIsCreatingRetailer(false)
    setEditingRetailer(null)
  }

  const handleSaveRetailer = async () => {
    try {
      setIsSavingRetailer(true)
      const data = { name: retailerForm.name, logoUrl: retailerForm.logoUrl || undefined }
      if (editingRetailer) {
        await updateRetailer(editingRetailer.id, data)
      } else {
        await createRetailer(data)
      }
      closeRetailerForm()
    } catch {
      // error notification already dispatched by useRetailers
    } finally {
      setIsSavingRetailer(false)
    }
  }

  const openCreateStoreForm = (retailerId: string) => {
    setStoreForm(emptyStoreForm)
    setAddingStoreForRetailerId(retailerId)
  }

  const openEditStoreForm = (store: Store) => {
    setStoreForm({ branchName: store.branchName, suburb: store.suburb ?? '', city: store.city })
    setEditingStore(store)
  }

  const closeStoreForm = () => {
    setAddingStoreForRetailerId(null)
    setEditingStore(null)
  }

  const handleSaveStore = async () => {
    try {
      setIsSavingStore(true)
      if (editingStore) {
        await updateStore(editingStore.id, {
          branchName: storeForm.branchName,
          suburb: storeForm.suburb || undefined,
          city: storeForm.city || undefined,
        })
      } else if (addingStoreForRetailerId) {
        await createStore({
          retailerId: addingStoreForRetailerId,
          branchName: storeForm.branchName,
          suburb: storeForm.suburb || undefined,
          city: storeForm.city || undefined,
        })
      }
      closeStoreForm()
    } catch {
      // error notification already dispatched by useStores
    } finally {
      setIsSavingStore(false)
    }
  }

  const handleDeleteStore = async () => {
    if (!deletingStore) return
    try {
      setIsDeletingStore(true)
      await deleteStore(deletingStore.id)
      setDeletingStore(null)
    } catch {
      // error notification already dispatched by useStores
    } finally {
      setIsDeletingStore(false)
    }
  }

  const storeColumns: DataTableColumn<Store>[] = [
    { key: 'branchName', header: 'Branch Name' },
    { key: 'suburb', header: 'Area', render: (row) => row.suburb ?? row.city },
  ]

  return (
    <div className="retailer-management-page">
      <div className="retailer-management-header">
        <h1 className="retailer-management-title">Retailers &amp; Stores</h1>
        <Button type="button" onClick={openCreateRetailerForm}>
          + New Retailer
        </Button>
      </div>

      {isLoading && <Spinner />}

      {!isLoading && retailers.length === 0 && <EmptyState title="No retailers yet." />}

      {!isLoading && retailers.length > 0 && (
        <div className="retailer-management-list">
          {retailers.map((retailer) => (
            <Card key={retailer.id} className="retailer-management-card">
              <div className="retailer-management-row">
                <button
                  type="button"
                  className="retailer-management-row-main"
                  onClick={() => toggleExpanded(retailer.id)}
                >
                  {retailer.logoUrl && (
                    <img src={retailer.logoUrl} alt="" className="retailer-management-logo" />
                  )}
                  <span className="retailer-management-name">{retailer.name}</span>
                </button>
                <div className="retailer-management-row-actions">
                  <button type="button" aria-label="Edit retailer" onClick={() => openEditRetailerForm(retailer)}>
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Add store" onClick={() => openCreateStoreForm(retailer.id)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedRetailerId === retailer.id && (
                <div className="retailer-management-stores">
                  <DataTable
                    columns={storeColumns}
                    rows={stores.filter((store) => store.retailerId === retailer.id)}
                    getRowId={(row) => row.id}
                    onEdit={openEditStoreForm}
                    onDelete={setDeletingStore}
                    emptyMessage="No stores yet."
                    isLoading={storesLoading}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <AdminFormModal
        isOpen={isCreatingRetailer || !!editingRetailer}
        title={editingRetailer ? 'Edit Retailer' : 'New Retailer'}
        onClose={closeRetailerForm}
        onSave={handleSaveRetailer}
        isSaving={isSavingRetailer}
      >
        <div className="retailer-management-form">
          <Input
            label="Name"
            value={retailerForm.name}
            onChange={(event) => setRetailerForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            label="Logo URL"
            value={retailerForm.logoUrl}
            onChange={(event) => setRetailerForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
          />
        </div>
      </AdminFormModal>

      <AdminFormModal
        isOpen={!!addingStoreForRetailerId || !!editingStore}
        title={editingStore ? 'Edit Store' : 'New Store'}
        onClose={closeStoreForm}
        onSave={handleSaveStore}
        isSaving={isSavingStore}
      >
        <div className="retailer-management-form">
          <Input
            label="Branch Name"
            value={storeForm.branchName}
            onChange={(event) => setStoreForm((prev) => ({ ...prev, branchName: event.target.value }))}
            required
          />
          <Input
            label="Suburb"
            value={storeForm.suburb}
            onChange={(event) => setStoreForm((prev) => ({ ...prev, suburb: event.target.value }))}
          />
          <Input
            label="City"
            value={storeForm.city}
            onChange={(event) => setStoreForm((prev) => ({ ...prev, city: event.target.value }))}
          />
        </div>
      </AdminFormModal>

      <ConfirmDialog
        isOpen={!!deletingStore}
        title="Delete Store"
        message={`Are you sure you want to delete "${deletingStore?.branchName}"? This cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeletingStore}
        onConfirm={handleDeleteStore}
        onCancel={() => setDeletingStore(null)}
      />
    </div>
  )
}

export default RetailerStoreManagement
