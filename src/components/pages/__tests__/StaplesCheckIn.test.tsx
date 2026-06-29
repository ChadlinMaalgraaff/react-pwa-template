import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StaplesCheckIn from '@components/pages/StaplesCheckIn/StaplesCheckIn'
import { PantryItem } from '@/types/pantry.types'

const makeItem = (name: string): PantryItem => ({
  id: `id-${name}`,
  ingredientId: `ing-${name}`,
  ingredientName: name,
  category: null,
  quantity: 1,
  unit: 'box',
  source: 'manual',
  addedAt: '2026-01-01T00:00:00Z',
})

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const addItem = vi.fn().mockResolvedValue(undefined)
const removeItem = vi.fn().mockResolvedValue(undefined)
let pantryState: { items: PantryItem[]; isLoading: boolean }

vi.mock('@hooks/usePantry', () => ({
  usePantry: () => ({
    items: pantryState.items,
    isLoading: pantryState.isLoading,
    addItem,
    removeItem,
  }),
}))

describe('StaplesCheckIn Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    addItem.mockClear()
    removeItem.mockClear()
    pantryState = { items: [], isLoading: false }
  })

  it('shows a spinner while the pantry is loading', () => {
    pantryState = { items: [], isLoading: true }
    render(<StaplesCheckIn />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Salt' })).not.toBeInTheDocument()
  })

  it('pre-selects default staples when the pantry is empty (new user)', () => {
    render(<StaplesCheckIn />)
    // Salt is a default — pre-selected for new users
    expect(screen.getByRole('button', { name: 'Remove Salt' })).toHaveAttribute('aria-pressed', 'true')
    // Cheddar Cheese is common but not a default — unselected
    expect(screen.getByRole('button', { name: 'Add Cheddar Cheese' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('groups staples under category headings, revealing empty categories on Show more', async () => {
    const user = userEvent.setup()
    render(<StaplesCheckIn />)

    // Produce has common staples, so its heading shows up-front
    expect(screen.getByRole('heading', { name: 'Produce' })).toBeInTheDocument()
    // Stock has no common staples, so its heading is hidden until expanded
    expect(screen.queryByRole('heading', { name: 'Stock' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show more' }))
    expect(screen.getByRole('heading', { name: 'Stock' })).toBeInTheDocument()
  })

  it('shows common staples up-front and hides the rest behind Show more', async () => {
    const user = userEvent.setup()
    render(<StaplesCheckIn />)

    // Cheddar Cheese is common (not default-selected); Cumin lives behind "Show more"
    expect(screen.getByRole('button', { name: 'Add Cheddar Cheese' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Cumin' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show more' }))
    expect(screen.getByRole('button', { name: 'Add Cumin' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show fewer' }))
    expect(screen.queryByRole('button', { name: 'Add Cumin' })).not.toBeInTheDocument()
  })

  it('auto-expands the full list when a hidden staple is already in the pantry', () => {
    pantryState = { items: [makeItem('Cumin')], isLoading: false }
    render(<StaplesCheckIn />)
    expect(screen.getByRole('button', { name: 'Remove Cumin' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'Show fewer' })).toBeInTheDocument()
  })

  it('pre-checks staples already in the pantry', () => {
    pantryState = { items: [makeItem('Salt')], isLoading: false }
    render(<StaplesCheckIn />)
    expect(screen.getByRole('button', { name: 'Remove Salt' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('toggles a chip on click', async () => {
    const user = userEvent.setup()
    render(<StaplesCheckIn />)
    // Salt is pre-selected by default; clicking it deselects it
    await user.click(screen.getByRole('button', { name: 'Remove Salt' }))
    expect(screen.getByRole('button', { name: 'Add Salt' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('commits added and removed staples on Next, then navigates to the pantry', async () => {
    pantryState = { items: [makeItem('Sugar')], isLoading: false }
    const user = userEvent.setup()
    render(<StaplesCheckIn />)

    // Select a new staple and deselect the pre-checked one
    await user.click(screen.getByRole('button', { name: 'Add Salt' }))
    await user.click(screen.getByRole('button', { name: 'Remove Sugar' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    await waitFor(() =>
      expect(addItem).toHaveBeenCalledWith({ ingredientName: 'Salt', quantity: 1, unit: 'box' })
    )
    expect(removeItem).toHaveBeenCalledWith('id-Sugar')
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/pantry'))
  })

  it('navigates to the pantry without changes when Skip is clicked', async () => {
    const user = userEvent.setup()
    render(<StaplesCheckIn />)
    await user.click(screen.getByRole('button', { name: 'Skip' }))

    expect(addItem).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
    expect(navigateMock).toHaveBeenCalledWith('/pantry')
  })
})
