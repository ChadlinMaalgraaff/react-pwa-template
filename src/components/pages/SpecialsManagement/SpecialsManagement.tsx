import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Badge, ConfirmDialog } from '@components/shared'
import { RetailerFilterBar } from '@components/specials'
import { IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { DataTable, DataTableColumn } from '@components/admin'
import { useSpecials } from '@hooks/useSpecials'
import { useRetailers } from '@hooks/useRetailers'
import { WeeklySpecial } from '@/types/specials.types'
import { formatDate } from '@utils/helpers'
import './SpecialsManagement.css'

const PAGE_SIZE = 10

const SpecialsManagement = () => {
  const navigate = useNavigate()
  const { retailers } = useRetailers()
  const [retailerId, setRetailerId] = useState<string | null>(null)
  const [unmappedOnly, setUnmappedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const { specials, total, isLoading, setParams, updateSpecial, deleteSpecial } = useSpecials({
    page: 1,
    pageSize: PAGE_SIZE,
  })
  const [mappingSpecialId, setMappingSpecialId] = useState<string | null>(null)
  const [deletingSpecial, setDeletingSpecial] = useState<WeeklySpecial | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setParams({
      page,
      pageSize: PAGE_SIZE,
      retailerId: retailerId ?? undefined,
    })
  }, [retailerId, page, setParams])

  const handleSelectRetailer = (id: string | null) => {
    setRetailerId(id)
    setPage(1)
  }

  const toggleUnmappedOnly = () => setUnmappedOnly((prev) => !prev)

  const handleMapIngredient = async (specialId: string, selection: IngredientSelection) => {
    if (!('id' in selection)) return
    try {
      await updateSpecial(specialId, { ingredientId: selection.id })
      setMappingSpecialId(null)
    } catch {
      // error notification already dispatched by useSpecials
    }
  }

  const handleDelete = async () => {
    if (!deletingSpecial) return
    try {
      setIsDeleting(true)
      await deleteSpecial(deletingSpecial.id)
      setDeletingSpecial(null)
    } catch {
      // error notification already dispatched by useSpecials
    } finally {
      setIsDeleting(false)
    }
  }

  const visibleSpecials = unmappedOnly ? specials.filter((special) => !special.ingredientId) : specials

  const columns: DataTableColumn<WeeklySpecial>[] = [
    { key: 'itemName', header: 'Item Name' },
    { key: 'retailerName', header: 'Retailer' },
    { key: 'storeId', header: 'Store', render: (row) => row.storeId ?? 'All stores' },
    { key: 'price', header: 'Price', render: (row) => `R${row.price.toFixed(2)}` },
    { key: 'validTo', header: 'Valid To', render: (row) => formatDate(row.validTo) },
    {
      key: 'ingredient',
      header: 'Ingredient',
      render: (row) =>
        mappingSpecialId === row.id ? (
          <div className="specials-management-mapping">
            <IngredientAutocomplete onSelect={(selection) => handleMapIngredient(row.id, selection)} />
            <Button type="button" variant="secondary" size="sm" onClick={() => setMappingSpecialId(null)}>
              Cancel
            </Button>
          </div>
        ) : row.ingredientName ? (
          <Badge variant="success">{row.ingredientName}</Badge>
        ) : (
          <button
            type="button"
            className="specials-management-mapping-button"
            onClick={() => setMappingSpecialId(row.id)}
          >
            <Badge variant="danger">Unmapped</Badge>
          </button>
        ),
    },
  ]

  return (
    <div className="specials-management-page">
      <div className="specials-management-header">
        <h1 className="specials-management-title">Weekly Specials</h1>
        <Button type="button" onClick={() => navigate('/admin/specials/upload')}>
          Upload New Specials
        </Button>
      </div>

      <div className="specials-management-filters">
        <RetailerFilterBar retailers={retailers} selectedRetailerId={retailerId} onSelect={handleSelectRetailer} />
        <Chip selected={unmappedOnly} onClick={toggleUnmappedOnly}>
          Unmapped only
        </Chip>
      </div>

      <DataTable
        columns={columns}
        rows={visibleSpecials}
        getRowId={(row) => row.id}
        onDelete={setDeletingSpecial}
        emptyMessage="No specials found."
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={!!deletingSpecial}
        title="Delete Special"
        message={`Are you sure you want to delete "${deletingSpecial?.itemName}"? This cannot be undone.`}
        confirmText="Delete"
        isDangerous
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSpecial(null)}
      />
    </div>
  )
}

export default SpecialsManagement
