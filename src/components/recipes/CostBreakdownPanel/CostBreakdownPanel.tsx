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

  const findIngredientName = (ingredientId: string) =>
    cost.missingIngredients.find((ingredient) => ingredient.ingredientId === ingredientId)?.name ?? ingredientId

  const findRetailerName = (ingredientId: string, retailerId: string) => {
    const ingredient = cost.missingIngredients.find((i) => i.ingredientId === ingredientId)
    return ingredient?.cheapestOffers.find((offer) => offer.retailerId === retailerId)?.retailerName ?? retailerId
  }

  return (
    <div className="cost-breakdown-panel">
      <button
        type="button"
        className="cost-breakdown-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <span>Cost Breakdown</span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isOpen && (
        <div className="cost-breakdown-content">
          {cost.cheapestSingleRetailer && (
            <div className="cost-breakdown-section">
              <h4 className="cost-breakdown-heading">Cheapest Single Retailer</h4>
              <p className="cost-breakdown-text">
                {cost.cheapestSingleRetailer.retailerName} — R{cost.cheapestSingleRetailer.total.toFixed(2)}
              </p>
            </div>
          )}

          <div className="cost-breakdown-section">
            <h4 className="cost-breakdown-heading">Cheapest Combination</h4>
            <p className="cost-breakdown-text">Total: R{cost.cheapestCombination.total.toFixed(2)}</p>
            <ul className="cost-breakdown-list">
              {Object.entries(cost.cheapestCombination.byIngredient).map(([ingredientId, offer]) => (
                <li key={ingredientId}>
                  {findIngredientName(ingredientId)}: R{offer.price.toFixed(2)} at{' '}
                  {findRetailerName(ingredientId, offer.retailerId)}
                </li>
              ))}
            </ul>
          </div>

          {cost.missingIngredients.length > 0 && (
            <div className="cost-breakdown-section">
              <h4 className="cost-breakdown-heading">Missing Ingredients</h4>
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
      )}
    </div>
  )
}

export default CostBreakdownPanel
