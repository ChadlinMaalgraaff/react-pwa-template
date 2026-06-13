import { Card, Badge } from '@components/shared'
import { formatDate } from '@utils/helpers'
import { WeeklySpecial } from '@/types/specials.types'
import './SpecialCard.css'

interface SpecialCardProps {
  special: WeeklySpecial
}

const SpecialCard = ({ special }: SpecialCardProps) => (
  <Card className="special-card">
    {special.imageUrl && <img src={special.imageUrl} alt={special.itemName} className="special-card-image" />}
    <div className="special-card-body">
      <p className="special-card-name">{special.itemName}</p>
      <Badge variant="neutral">{special.retailerName}</Badge>
      <p className="special-card-price">R{special.price.toFixed(2)}</p>
      <p className="special-card-validity">
        Valid {formatDate(special.validFrom)} - {formatDate(special.validTo)}
      </p>
    </div>
  </Card>
)

export default SpecialCard
