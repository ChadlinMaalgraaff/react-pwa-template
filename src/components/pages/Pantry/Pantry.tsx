import { useState } from 'react'
import { Camera, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, BottomSheet, EmptyState, Spinner, QuantityStepper } from '@components/shared'
import { PantryItemRow, IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { usePantry } from '@hooks/usePantry'
import { groupItemsByCategory } from './groupItemsByCategory'
import './Pantry.css'

const Pantry = () => {
  const navigate = useNavigate()
  const { items, isLoading, addItem, updateItem, removeItem } = usePantry()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selection, setSelection] = useState<IngredientSelection | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const closeAddSheet = () => {
    setIsAddOpen(false)
    setSelection(null)
    setQuantity(1)
    setUnit('')
  }

  const handleIngredientSelect = (value: IngredientSelection) => {
    setSelection(value)
    if ('defaultUnit' in value) {
      setUnit(value.defaultUnit)
    }
  }

  const handleAdd = async () => {
    if (!selection) return
    setIsSaving(true)
    try {
      await addItem(
        'id' in selection
          ? { ingredientId: selection.id, quantity, unit }
          : { ingredientName: selection.ingredientName, quantity, unit }
      )
      closeAddSheet()
    } finally {
      setIsSaving(false)
    }
  }

  const groups = groupItemsByCategory(items)

  return (
    <div className="pantry-page">
      <div className="pantry-actions">
        <button type="button" aria-label="Capture pantry photo" onClick={() => navigate('/pantry/capture')}>
          <Camera className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Add item" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <Spinner fullScreen />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your pantry is empty"
          message="Add items manually or snap a photo."
          actionLabel="Add Item"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="pantry-groups">
          {groups.map(([category, categoryItems]) => (
            <section key={category} className="pantry-group">
              <h2 className="pantry-group-title">{category}</h2>
              {categoryItems.map((item) => (
                <PantryItemRow
                  key={item.id}
                  item={item}
                  onQuantityChange={(id, value) => updateItem(id, { quantity: value })}
                  onDelete={removeItem}
                />
              ))}
            </section>
          ))}
        </div>
      )}

      <BottomSheet isOpen={isAddOpen} onClose={closeAddSheet} title="Add Item">
        <div className="pantry-add-form">
          <IngredientAutocomplete onSelect={handleIngredientSelect} />
          {selection && (
            <div className="pantry-add-selected">
              <span>{'id' in selection ? selection.name : selection.ingredientName}</span>
              <QuantityStepper value={quantity} unit={unit} onChange={setQuantity} />
            </div>
          )}
          <Button type="button" onClick={handleAdd} disabled={!selection} isLoading={isSaving} className="w-full">
            Add
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Pantry
