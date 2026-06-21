import { useState } from 'react'
import { Camera, Package, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, BottomSheet, Spinner, QuantityStepper } from '@components/shared'
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
        <button type="button" aria-label="Add item" onClick={openAddSheet} className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-line bg-surface shadow-sm text-ink-soft">
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>

      {isLoading ? (
        <Spinner fullScreen />
      ) : !hasItems ? (
        <div className="pantry-empty">
          <div className="pantry-empty-icon">
            <Package className="h-11 w-11 text-primary" strokeWidth={1.6} />
          </div>
          <p className="pantry-empty-title">Let's stock your pantry</p>
          <p className="pantry-empty-message">
            Snap a photo of your shelf, or add items one at a time.
          </p>
          <div className="pantry-empty-actions">
            <Button onClick={() => navigate('/pantry/capture')}>
              <Camera className="h-[18px] w-[18px]" />
              Scan pantry
            </Button>
            <Button variant="secondary" onClick={openAddSheet}>
              <Plus className="h-[18px] w-[18px]" />
              Add manually
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="pantry-summary-badge">
            <Badge variant="success">✓ {items.length} items fresh</Badge>
          </div>
          <div className="pantry-groups">
            {groups.map(([category, categoryItems]) => (
              <section key={category} className="pantry-group">
                <h2 className="pantry-group-title">{category}</h2>
                <div className="card overflow-hidden p-0">
                  {categoryItems.map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      onQuantityChange={(id, value) => updateItem(id, { quantity: value })}
                      onDelete={removeItem}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {hasItems && (
        <button
          type="button"
          aria-label="Capture pantry photo"
          className="pantry-fab"
          onClick={() => navigate('/pantry/capture')}
        >
          <Camera className="h-[18px] w-[18px]" />
          <span>Scan &amp; add</span>
        </button>
      )}

      <BottomSheet isOpen={isAddOpen} onClose={closeAddSheet} title="Add item">
        <div className="pantry-add-form">
          {lastAddedName && (
            <p className="pantry-add-confirmation" role="status">
              ✓ {lastAddedName} added
            </p>
          )}
          <IngredientAutocomplete onSelect={handleIngredientSelect} />
          {selection && (
            <div className="pantry-add-selected">
              <div>
                <span className="pantry-add-selected-label">Selected</span>
                <span className="pantry-add-selected-name">
                  {'id' in selection ? selection.name : selection.ingredientName}
                </span>
              </div>
              <QuantityStepper value={quantity} unit={unit} onChange={setQuantity} />
            </div>
          )}
          <Button type="button" onClick={handleAdd} disabled={!selection} isLoading={isSaving}>
            Add to pantry
          </Button>
          <Button type="button" variant="secondary" onClick={closeAddSheet}>
            Done
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isClearOpen} onClose={() => setIsClearOpen(false)}>
        <div className="pantry-clear-confirm">
          <div className="pantry-clear-icon">
            <Trash2 className="h-6 w-6" />
          </div>
          <p className="pantry-clear-title">Clear your pantry?</p>
          <p className="pantry-clear-message">
            This removes all <strong className="text-ink">{items.length} items</strong>. You can re-scan or add them again whenever you like.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={handleClearConfirm}
            isLoading={isClearing}
          >
            Clear pantry
          </Button>
          <Button type="button" variant="secondary" onClick={() => setIsClearOpen(false)}>
            Cancel
          </Button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Pantry
