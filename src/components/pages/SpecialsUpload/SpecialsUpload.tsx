import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/shared'
import { BulkSpecialsForm } from '@components/admin'
import { useRetailers } from '@hooks/useRetailers'
import { useStores } from '@hooks/useStores'
import { useSpecialsUpload } from '@hooks/useSpecialsUpload'
import { CreateSpecialsRequest } from '@/types/specials.types'
import './SpecialsUpload.css'

const todayIsoDate = () => new Date().toISOString().slice(0, 10)

const createInitialValue = (): CreateSpecialsRequest => ({
  retailerId: '',
  validFrom: todayIsoDate(),
  validTo: todayIsoDate(),
  items: [{ itemName: '', price: 0, unit: '' }],
})

const SpecialsUpload = () => {
  const navigate = useNavigate()
  const { retailers } = useRetailers()
  const { stores, fetchStoresForRetailer } = useStores()
  const { uploadSpecials, isSaving } = useSpecialsUpload()
  const [value, setValue] = useState<CreateSpecialsRequest>(createInitialValue())
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (value.retailerId) {
      fetchStoresForRetailer(value.retailerId).catch(() => {
        // error notification already dispatched by useStores
      })
    }
  }, [value.retailerId, fetchStoresForRetailer])

  const handleUpload = async () => {
    if (!value.retailerId) {
      setValidationError('Please select a retailer.')
      return
    }
    const validItems = value.items.filter((item) => item.itemName.trim() && item.price > 0)
    if (validItems.length === 0) {
      setValidationError('Add at least one item with a name and price.')
      return
    }
    setValidationError(null)

    try {
      await uploadSpecials({ ...value, items: validItems })
      navigate('/admin/specials')
    } catch {
      // error notification already dispatched by useSpecialsUpload
    }
  }

  return (
    <div className="specials-upload-page">
      <h1 className="specials-upload-title">Upload Weekly Specials</h1>

      <BulkSpecialsForm retailers={retailers} stores={stores} value={value} onChange={setValue} />

      {validationError && <p className="specials-upload-error">{validationError}</p>}

      <div className="specials-upload-actions">
        <Button type="button" onClick={handleUpload} isLoading={isSaving}>
          Upload {value.items.length} Special{value.items.length === 1 ? '' : 's'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => navigate('/admin/specials')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default SpecialsUpload
