import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpecialCard from '@components/specials/SpecialCard/SpecialCard'
import { WeeklySpecial } from '@/types/specials.types'

const special: WeeklySpecial = {
  id: 'special-1',
  retailerId: 'ret-1',
  retailerName: 'Checkers',
  storeId: null,
  ingredientId: 'ing-1',
  ingredientName: 'Rice',
  itemName: 'Basmati Rice 2kg',
  price: 49.99,
  unit: 'each',
  imageUrl: 'https://example.com/rice.jpg',
  validFrom: '2026-06-01T00:00:00.000Z',
  validTo: '2026-06-30T00:00:00.000Z',
}

describe('SpecialCard Component', () => {
  it('renders the item name, retailer, price, and validity range', () => {
    render(<SpecialCard special={special} />)
    expect(screen.getByText('Basmati Rice 2kg')).toBeInTheDocument()
    expect(screen.getByText('Checkers')).toBeInTheDocument()
    expect(screen.getByText('R49.99')).toBeInTheDocument()
    expect(screen.getByText(/Valid/)).toBeInTheDocument()
    expect(screen.getByAltText('Basmati Rice 2kg')).toBeInTheDocument()
  })
})
