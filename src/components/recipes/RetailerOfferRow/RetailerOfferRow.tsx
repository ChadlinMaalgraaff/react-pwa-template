import { formatDate } from '@utils/helpers'
import './RetailerOfferRow.css'

interface RetailerOfferRowProps {
  retailerName: string
  itemName: string
  price: number
  validTo: string
  logoUrl?: string | null
}

const RetailerOfferRow = ({ retailerName, itemName, price, validTo, logoUrl }: RetailerOfferRowProps) => (
  <div className="retailer-offer-row">
    <div className="retailer-offer-info">
      {logoUrl && <img src={logoUrl} alt={retailerName} className="retailer-offer-logo" />}
      <div>
        <p className="retailer-offer-item">{itemName}</p>
        <p className="retailer-offer-retailer">{retailerName}</p>
      </div>
    </div>
    <div className="retailer-offer-price-info">
      <span className="retailer-offer-price">R{price.toFixed(2)}</span>
      <span className="retailer-offer-valid">Valid until {formatDate(validTo)}</span>
    </div>
  </div>
)

export default RetailerOfferRow
