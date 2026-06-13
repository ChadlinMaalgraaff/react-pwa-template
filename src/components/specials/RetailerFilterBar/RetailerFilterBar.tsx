import { Chip } from '@components/shared'
import { Retailer } from '@/types/retailers.types'
import './RetailerFilterBar.css'

interface RetailerFilterBarProps {
  retailers: Retailer[]
  selectedRetailerId: string | null
  onSelect: (retailerId: string | null) => void
}

const RetailerFilterBar = ({ retailers, selectedRetailerId, onSelect }: RetailerFilterBarProps) => (
  <div className="retailer-filter-bar">
    <Chip selected={selectedRetailerId === null} onClick={() => onSelect(null)}>
      All
    </Chip>
    {retailers.map((retailer) => (
      <Chip
        key={retailer.id}
        selected={selectedRetailerId === retailer.id}
        onClick={() => onSelect(retailer.id)}
      >
        {retailer.name}
      </Chip>
    ))}
  </div>
)

export default RetailerFilterBar
