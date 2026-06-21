import { useState } from 'react'
import { Camera, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, BottomSheet, Spinner, QuantityStepper } from '@components/shared'
import { PantryItemRow, IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { usePantry } from '@hooks/usePantry'
import { groupItemsByCategory } from './groupItemsByCategory'
import './Pantry.css'

const Pantry = () => {
  const navigate = useNavigate()
  const { items, isLoading, addItem, updateItem, removeItem, clearAll } = usePantry()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selection, setSelection] = useState<IngredientSelection | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastAddedName, setLastAddedName] = useState<string | null>(null)
  const [isClearOpen, setIsClearOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const openAddSheet = () => {
    setLastAddedName(null)
    setIsAddOpen(true)
  }

  const closeAddSheet = () => {
    setIsAddOpen(false)
    setSelection(null)
    setQuantity(1)
    setUnit('')
    setLastAddedName(null)
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
    const name = 'id' in selection ? selection.name : selection.ingredientName
    try {
      await addItem(
        'id' in selection
          ? { ingredientId: selection.id, quantity, unit }
          : { ingredientName: selection.ingredientName, quantity, unit }
      )
      setLastAddedName(name)
      setSelection(null)
      setQuantity(1)
      setUnit('')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearConfirm = async () => {
    setIsClearing(true)
    try {
      await clearAll()
      setIsClearOpen(false)
    } finally {
      setIsClearing(false)
    }
  }

  const groups = groupItemsByCategory(items)
  const hasItems = items.length > 0

  return (
    <div className="pantry-page">
      <div className="pantry-actions">
        {hasItems && (
          <button
            type="button"
            aria-label="Clear pantry"
            className="pantry-clear-btn"
            onClick={() => setIsClearOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
        <button type="button" aria-label="Add item" onClick={openAddSheet}>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {isLoading ? (
        <Spinner fullScreen />
      ) : !hasItems ? (
        <div className="pantry-empty">
          <p className="pantry-empty-title">Your pantry is empty</p>
          <p className="pantry-empty-message">
            Snap a photo of your shelf or add items manually.
          </p>
          <div className="pantry-empty-actions">
            <Button onClick={() => navigate('/pantry/capture')} className="flex-1">
              <Camera className="h-4 w-4" />
              Scan Pantry
            </Button>
            <Button variant="secondary" onClick={openAddSheet} className="flex-1">
              <Plus className="h-4 w-4" />
              Add Manually
            </Button>
          </div>
        </div>
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

      {hasItems && (
        <button
          type="button"
          aria-label="Capture pantry photo"
          className="pantry-fab"
          onClick={() => navigate('/pantry/capture')}
        >
          <Camera className="h-5 w-5" />
          <span>Scan & Add</span>
        </button>
      )}

      <BottomSheet isOpen={isAddOpen} onClose={closeAddSheet} title="Add Item">
        <div className="pantry-add-form">
          {lastAddedName && (
            <p className="pantry-add-confirmation" role="status">
              ✓ {lastAddedName} added
            </p>
          )}
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
          <Button type="button" variant="secondary" onClick={closeAddSheet} className="w-full">
            Done
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isClearOpen} onClose={() => setIsClearOpen(false)} title="Clear your pantry?">
        <div className="pantry-clear-confirm">
          <p className="pantry-clear-message">
            This will remove all {items.length} item{items.length !== 1 ? 's' : ''}. You can re-scan or add items again afterwards.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={handleClearConfirm}
            isLoading={isClearing}
            className="w-full"
          >
            Clear Pantry
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsClearOpen(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Pantry
