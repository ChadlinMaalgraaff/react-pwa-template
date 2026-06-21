import { Beef, Leaf, Package, Trash2, Wheat } from 'lucide-react'
import { PantryItem } from '@/types/pantry.types'
import { QuantityStepper } from '@components/shared'
import './PantryItemRow.css'

interface PantryItemRowProps {
  item: PantryItem
  onQuantityChange: (id: string, quantity: number) => void
  onDelete: (id: string) => void
}

const categoryIcon = (category: string | undefined) => {
  const cat = (category ?? '').toLowerCase()
  if (cat.includes('produce') || cat.includes('vegetable') || cat.includes('fruit')) return Leaf
  if (cat.includes('protein') || cat.includes('meat') || cat.includes('poultry') || cat.includes('seafood')) return Beef
  if (cat.includes('grain') || cat.includes('bread') || cat.includes('pasta') || cat.includes('cereal')) return Wheat
  return Package
}

const PantryItemRow = ({ item, onQuantityChange, onDelete }: PantryItemRowProps) => {
  const Icon = categoryIcon(item.category)

  return (
    <div className="pantry-item-row">
      <span className="pantry-item-thumb">
        <Icon className="h-5 w-5" strokeWidth={1.7} />
      </span>
      <div className="pantry-item-info">
        <span className="pantry-item-name">{item.ingredientName}</span>
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
}

export default PantryItemRow
