import { Trash2 } from 'lucide-react'
import { Badge } from '@components/shared'
import { ShoppingListItem } from '@/types/shopping-lists.types'
import './ShoppingListItemRow.css'

interface ShoppingListItemRowProps {
  item: ShoppingListItem
  onToggle: (id: string, isChecked: boolean) => void
  onDelete: (id: string) => void
}

const ShoppingListItemRow = ({ item, onToggle, onDelete }: ShoppingListItemRowProps) => (
  <div className="shopping-list-item-row">
    <input
      type="checkbox"
      checked={item.isChecked}
      onChange={(event) => onToggle(item.id, event.target.checked)}
      aria-label={`Mark ${item.ingredientName} as ${item.isChecked ? 'unchecked' : 'checked'}`}
      className="shopping-list-item-checkbox"
    />
    <div className={`shopping-list-item-info ${item.isChecked ? 'shopping-list-item-checked' : ''}`}>
      <p className="shopping-list-item-name">
        {item.ingredientName} — {item.quantity} {item.unit}
      </p>
      {item.recipeTitle && <Badge variant="neutral">{item.recipeTitle}</Badge>}
    </div>
    <button
      type="button"
      aria-label={`Delete ${item.ingredientName}`}
      onClick={() => onDelete(item.id)}
      className="shopping-list-item-delete"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  </div>
)

export default ShoppingListItemRow
