import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RetailerOfferRow from '@components/recipes/RetailerOfferRow/RetailerOfferRow'

describe('RetailerOfferRow Component', () => {
  it('renders the retailer name, item name, price, and valid-until date', () => {
    render(
      <RetailerOfferRow
        retailerName="Checkers"
        itemName="Basmati Rice 2kg"
        price={49.99}
        validTo="2026-06-30T00:00:00.000Z"
      />
    )
    expect(screen.getByText('Checkers')).toBeInTheDocument()
    expect(screen.getByText('Basmati Rice 2kg')).toBeInTheDocument()
    expect(screen.getByText('R49.99')).toBeInTheDocument()
    expect(screen.getByText(/Valid until/)).toBeInTheDocument()
  })

  it('renders the retailer logo when provided', () => {
    render(
      <RetailerOfferRow
        retailerName="Checkers"
        itemName="Basmati Rice 2kg"
        price={49.99}
        validTo="2026-06-30T00:00:00.000Z"
        logoUrl="https://example.com/checkers.png"
      />
    )
    expect(screen.getByAltText('Checkers')).toBeInTheDocument()
  })
})
