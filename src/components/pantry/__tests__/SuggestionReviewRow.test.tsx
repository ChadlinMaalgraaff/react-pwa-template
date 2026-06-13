import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SuggestionReviewRow from '@components/pantry/SuggestionReviewRow/SuggestionReviewRow'
import { PantrySuggestion } from '@/types/pantry.types'

const matchedSuggestion: PantrySuggestion = {
  ingredientId: 'ing-1',
  name: 'Rice',
  matchedExisting: true,
  quantity: 2,
  unit: 'kg',
  confidence: 0.9,
}

const newSuggestion: PantrySuggestion = {
  ingredientId: null,
  name: 'Mystery Sauce',
  matchedExisting: false,
  quantity: 1,
  unit: 'bottle',
  confidence: 0.3,
}

describe('SuggestionReviewRow Component', () => {
  it('renders matched ingredient name as plain text', () => {
    render(<SuggestionReviewRow suggestion={matchedSuggestion} onChange={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.queryByLabelText('Ingredient name')).not.toBeInTheDocument()
  })

  it('renders an editable input for unmatched suggestions', () => {
    render(<SuggestionReviewRow suggestion={newSuggestion} onChange={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByLabelText('Ingredient name')).toHaveValue('Mystery Sauce')
  })

  it('shows a low-confidence badge when confidence is below the threshold', () => {
    render(<SuggestionReviewRow suggestion={newSuggestion} onChange={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.getByText('Low confidence')).toBeInTheDocument()
  })

  it('does not show a low-confidence badge for high-confidence suggestions', () => {
    render(<SuggestionReviewRow suggestion={matchedSuggestion} onChange={vi.fn()} onRemove={vi.fn()} />)
    expect(screen.queryByText('Low confidence')).not.toBeInTheDocument()
  })

  it('calls onChange when the quantity stepper is used', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<SuggestionReviewRow suggestion={matchedSuggestion} onChange={handleChange} onRemove={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(handleChange).toHaveBeenCalledWith({ ...matchedSuggestion, quantity: 3 })
  })

  it('calls onRemove when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(<SuggestionReviewRow suggestion={matchedSuggestion} onChange={vi.fn()} onRemove={handleRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remove suggestion' }))
    expect(handleRemove).toHaveBeenCalled()
  })
})
