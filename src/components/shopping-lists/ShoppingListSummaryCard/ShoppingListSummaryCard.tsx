import { Trash2 } from 'lucide-react'
import { Card } from '@components/shared'
import { formatDate } from '@utils/helpers'
import { ShoppingListSummary } from '@/types/shopping-lists.types'
import './ShoppingListSummaryCard.css'

interface ShoppingListSummaryCardProps {
  list: ShoppingListSummary
  onClick?: () => void
  onDelete?: (id: string) => void
}

const ShoppingListSummaryCard = ({ list, onClick, onDelete }: ShoppingListSummaryCardProps) => {
  const details = (
    <>
      <p className="shopping-list-summary-name">{list.name}</p>
      <p className="shopping-list-summary-meta">
        {list.itemCount} item{list.itemCount === 1 ? '' : 's'} · Created {formatDate(list.createdAt)}
      </p>
    </>
  )

  return (
    <Card className="shopping-list-summary-card shopping-list-summary-row">
      {onClick ? (
        <button type="button" onClick={onClick} className="shopping-list-summary-button">
          {details}
        </button>
      ) : (
        <div className="shopping-list-summary-button">{details}</div>
      )}
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete ${list.name}`}
          onClick={() => onDelete(list.id)}
          className="shopping-list-summary-delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </Card>
  )
}

export default ShoppingListSummaryCard
