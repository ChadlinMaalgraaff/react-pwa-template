import { useState } from 'react'
import { X } from 'lucide-react'
import { Input, Select, Button } from '@components/shared'
import { IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { Retailer, Store } from '@/types/retailers.types'
import { CreateSpecialItemInput, CreateSpecialsRequest } from '@/types/specials.types'
import './BulkSpecialsForm.css'

interface BulkSpecialsFormProps {
  retailers: Retailer[]
  stores: Store[]
  value: CreateSpecialsRequest
  onChange: (value: CreateSpecialsRequest) => void
}

const createEmptyItem = (): CreateSpecialItemInput => ({ itemName: '', price: 0, unit: '' })

const BulkSpecialsForm = ({ retailers, stores, value, onChange }: BulkSpecialsFormProps) => {
  const [ingredientNames, setIngredientNames] = useState<Record<number, string>>({})

  const retailerStores = stores.filter((store) => store.retailerId === value.retailerId)

  const updateItem = (index: number, item: CreateSpecialItemInput) => {
    onChange({ ...value, items: value.items.map((existing, i) => (i === index ? item : existing)) })
  }

  const handleIngredientSelect = (
    index: number,
    item: CreateSpecialItemInput,
    selection: IngredientSelection
  ) => {
    if ('id' in selection) {
      updateItem(index, { ...item, ingredientId: selection.id, itemName: item.itemName || selection.name })
      setIngredientNames((prev) => ({ ...prev, [index]: selection.name }))
    } else {
      updateItem(index, { ...item, ingredientId: undefined, itemName: item.itemName || selection.ingredientName })
      setIngredientNames((prev) => ({ ...prev, [index]: selection.ingredientName }))
    }
  }

  const addItem = () => onChange({ ...value, items: [...value.items, createEmptyItem()] })

  const removeItem = (index: number) => {
    onChange({ ...value, items: value.items.filter((_, i) => i !== index) })
    setIngredientNames((prev) => {
      const next: Record<number, string> = {}
      Object.entries(prev).forEach(([key, name]) => {
        const i = Number(key)
        if (i < index) next[i] = name
        else if (i > index) next[i - 1] = name
      })
      return next
    })
  }

  return (
    <div className="bulk-specials-form">
      <div className="bulk-specials-form-header">
        <Select
          label="Retailer"
          value={value.retailerId}
          onChange={(event) => onChange({ ...value, retailerId: event.target.value })}
          options={retailers.map((retailer) => ({ value: retailer.id, label: retailer.name }))}
          placeholder="Select retailer"
        />
        <Input
          label="Valid From"
          type="date"
          value={value.validFrom}
          onChange={(event) => onChange({ ...value, validFrom: event.target.value })}
        />
        <Input
          label="Valid To"
          type="date"
          value={value.validTo}
          onChange={(event) => onChange({ ...value, validTo: event.target.value })}
        />
      </div>
      <div className="bulk-specials-form-items">
        {value.items.map((item, index) => (
          <div key={index} className="bulk-specials-form-row">
            <Input
              aria-label="Item name"
              placeholder="Item name"
              value={item.itemName}
              onChange={(event) => updateItem(index, { ...item, itemName: event.target.value })}
              className="bulk-specials-form-item-name"
            />
            <Input
              aria-label="Price"
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(event) => updateItem(index, { ...item, price: Number(event.target.value) })}
              className="bulk-specials-form-price"
            />
            <Input
              aria-label="Unit"
              placeholder="Unit"
              value={item.unit ?? ''}
              onChange={(event) => updateItem(index, { ...item, unit: event.target.value })}
              className="bulk-specials-form-unit"
            />
            <Select
              aria-label="Store"
              value={item.storeId ?? ''}
              onChange={(event) => updateItem(index, { ...item, storeId: event.target.value || undefined })}
              options={retailerStores.map((store) => ({ value: store.id, label: store.branchName }))}
              placeholder="Any store"
            />
            <div className="bulk-specials-form-ingredient">
              <IngredientAutocomplete
                onSelect={(selection) => handleIngredientSelect(index, item, selection)}
                placeholder="Link ingredient..."
              />
              {ingredientNames[index] && (
                <span className="bulk-specials-form-ingredient-name">Linked: {ingredientNames[index]}</span>
              )}
            </div>
            <button type="button" aria-label="Remove item" onClick={() => removeItem(index)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={addItem}>
        Add Item
      </Button>
    </div>
  )
}

export default BulkSpecialsForm
