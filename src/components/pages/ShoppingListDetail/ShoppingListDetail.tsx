import { useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, BottomSheet, EmptyState, Spinner, QuantityStepper } from '@components/shared'
import { ShoppingListItemRow } from '@components/shopping-lists'
import { IngredientAutocomplete, IngredientSelection } from '@components/pantry'
import { useShoppingListDetail } from '@hooks/useShoppingListDetail'
import { groupItemsByRecipe } from './groupItemsByRecipe'
import './ShoppingListDetail.css'

const ShoppingListDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { list, isLoading, error, addItem, updateItem, removeItem } = useShoppingListDetail(id)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selection, setSelection] = useState<IngredientSelection | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && error) {
      navigate('/shopping-lists')
    }
  }, [isLoading, error, navigate])

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

  if (isLoading || !list) {
    return <Spinner fullScreen />
  }

  const groups = groupItemsByRecipe(list.items)

  return (
    <div className="shopping-list-detail-page">
      <div className="shopping-list-detail-header">
        <button type="button" aria-label="Back to shopping lists" onClick={() => navigate('/shopping-lists')}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="shopping-list-detail-title">{list.name}</h1>
        <button type="button" aria-label="Add item" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {list.items.length === 0 ? (
        <EmptyState title="This list is empty" message="Add items or add a recipe from Recipe Detail." />
      ) : (
        <div className="shopping-list-detail-groups">
          {groups.map(([group, items]) => (
            <section key={group} className="shopping-list-detail-group">
              <h2 className="shopping-list-detail-group-title">{group}</h2>
              {items.map((item) => (
                <ShoppingListItemRow
                  key={item.id}
                  item={item}
                  onToggle={(itemId, isChecked) => updateItem(itemId, { isChecked })}
                  onDelete={removeItem}
                />
              ))}
            </section>
          ))}
        </div>
      )}

      <BottomSheet isOpen={isAddOpen} onClose={closeAddSheet} title="Add Item">
        <div className="shopping-list-detail-add-form">
          <IngredientAutocomplete onSelect={handleIngredientSelect} />
          {selection && (
            <div className="shopping-list-detail-add-selected">
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

export default ShoppingListDetail
