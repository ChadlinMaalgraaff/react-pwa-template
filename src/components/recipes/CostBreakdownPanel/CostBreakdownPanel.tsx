import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RecipeCostResponse } from '@/types/recipes.types'
import RetailerOfferRow from '../RetailerOfferRow/RetailerOfferRow'
import './CostBreakdownPanel.css'

interface CostBreakdownPanelProps {
  cost: RecipeCostResponse
  defaultOpen?: boolean
}

const CostBreakdownPanel = ({ cost, defaultOpen = false }: CostBreakdownPanelProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="cost-breakdown-panel">
      <button
        type="button"
        className="cost-breakdown-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>Missing ingredients in pantry</span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="cost-breakdown-content">
          {cost.missingIngredients.map((ingredient) => (
            <div key={ingredient.ingredientId} className="cost-breakdown-ingredient">
              <p className="cost-breakdown-text">
                {ingredient.name} ({ingredient.quantity} {ingredient.unit})
              </p>
              {ingredient.cheapestOffers.map((offer, index) => (
                <RetailerOfferRow
                  key={`${offer.retailerId}-${index}`}
                  retailerName={offer.retailerName}
                  itemName={offer.itemName}
                  price={offer.price}
                  validTo={offer.validTo}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CostBreakdownPanel
