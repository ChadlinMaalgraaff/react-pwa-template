import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CostBreakdownPanel from '@components/recipes/CostBreakdownPanel/CostBreakdownPanel'
import { RecipeCostResponse } from '@/types/recipes.types'

const cost: RecipeCostResponse = {
  recipeId: 'recipe-1',
  missingIngredients: [
    {
      ingredientId: 'ing-1',
      name: 'Saffron',
      quantity: 1,
      unit: 'pinch',
      cheapestOffers: [
        { retailerId: 'ret-1', retailerName: 'Checkers', itemName: 'Saffron 1g', price: 89.99, validTo: '2026-06-30T00:00:00.000Z' },
      ],
    },
  ],
  cheapestSingleRetailer: {
    retailerId: 'ret-1',
    retailerName: 'Checkers',
    total: 89.99,
    coversIngredientIds: ['ing-1'],
  },
  cheapestCombination: {
    total: 89.99,
    byIngredient: {
      'ing-1': { retailerId: 'ret-1', price: 89.99 },
    },
  },
  uncoveredIngredientIds: [],
}

describe('CostBreakdownPanel Component', () => {
  it('is collapsed by default', () => {
    render(<CostBreakdownPanel cost={cost} />)
    expect(screen.queryByText('Saffron (1 pinch)')).not.toBeInTheDocument()
  })

  it('expands to show missing ingredients when toggled', async () => {
    const user = userEvent.setup()
    render(<CostBreakdownPanel cost={cost} />)

    await user.click(screen.getByRole('button', { name: /missing ingredients in pantry/i }))

    expect(screen.getByText('Saffron (1 pinch)')).toBeInTheDocument()
    expect(screen.getByText('Saffron 1g')).toBeInTheDocument()
  })
})
