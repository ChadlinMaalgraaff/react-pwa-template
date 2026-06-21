import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PantryStaplesSection from '@components/pantry/PantryStaplesSection/PantryStaplesSection'
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

const onAdd = vi.fn().mockResolvedValue(undefined)
const onRemove = vi.fn().mockResolvedValue(undefined)

const renderSection = (items: PantryItem[] = [], defaultExpanded = true) =>
  render(
    <PantryStaplesSection
      items={items}
      onAdd={onAdd}
      onRemove={onRemove}
      defaultExpanded={defaultExpanded}
    />
  )

describe('PantryStaplesSection', () => {
  beforeEach(() => {
    onAdd.mockClear()
    onRemove.mockClear()
  })

  it('is collapsed by default when defaultExpanded is false', () => {
    renderSection([], false)
    expect(screen.queryByText('Salt')).not.toBeInTheDocument()
  })

  it('is expanded when defaultExpanded is true', () => {
    renderSection([], true)
    expect(screen.getByRole('button', { name: 'Add Salt' })).toBeInTheDocument()
  })

  it('toggles expanded state when the header is clicked', async () => {
    const user = userEvent.setup()
    renderSection([], false)
    expect(screen.queryByText('Salt')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /staples/i }))
    expect(screen.getByRole('button', { name: 'Add Salt' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /staples/i }))
    expect(screen.queryByText('Salt')).not.toBeInTheDocument()
  })

  it('shows inactive chips for staples not in pantry', () => {
    renderSection([], true)
    const saltBtn = screen.getByRole('button', { name: 'Add Salt' })
    expect(saltBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows active chips for staples already in pantry', () => {
    renderSection([makeItem('Salt')], true)
    const saltBtn = screen.getByRole('button', { name: 'Remove Salt' })
    expect(saltBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onAdd with name, quantity, unit when an inactive chip is clicked', async () => {
    const user = userEvent.setup()
    renderSection([], true)
    await user.click(screen.getByRole('button', { name: 'Add Salt' }))
    expect(onAdd).toHaveBeenCalledWith('Salt', 1, 'box')
  })

  it('calls onRemove with the pantry item id when an active chip is clicked', async () => {
    const user = userEvent.setup()
    renderSection([makeItem('Salt')], true)
    await user.click(screen.getByRole('button', { name: 'Remove Salt' }))
    expect(onRemove).toHaveBeenCalledWith('id-Salt')
  })

  it('is case-insensitive when matching pantry items to staples', () => {
    renderSection([makeItem('salt')], true)
    expect(screen.getByRole('button', { name: 'Remove Salt' })).toBeInTheDocument()
  })
})
