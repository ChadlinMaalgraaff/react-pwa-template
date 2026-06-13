import { Trash2 } from 'lucide-react'
import { PantryItem } from '@/types/pantry.types'
import { QuantityStepper } from '@components/shared'
import './PantryItemRow.css'

interface PantryItemRowProps {
  item: PantryItem
  onQuantityChange: (id: string, quantity: number) => void
  onDelete: (id: string) => void
}

const PantryItemRow = ({ item, onQuantityChange, onDelete }: PantryItemRowProps) => (
  <div className="pantry-item-row">
    <div className="pantry-item-info">
      <p className="pantry-item-name">{item.ingredientName}</p>
      {item.category && <p className="pantry-item-category">{item.category}</p>}
    </div>
    <QuantityStepper
      value={item.quantity}
      unit={item.unit}
      onChange={(quantity) => onQuantityChange(item.id, quantity)}
    />
    <button
      type="button"
      aria-label={`Delete ${item.ingredientName}`}
      onClick={() => onDelete(item.id)}
      className="pantry-item-delete"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  </div>
)

export default PantryItemRow
