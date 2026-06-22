import { describe, it, expect } from 'vitest'
import { diffStaples } from '@components/pages/StaplesCheckIn/diffStaples'
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

describe('diffStaples', () => {
  it('adds selected staples that are not yet in the pantry', () => {
    const { toAdd, toRemove } = diffStaples(new Set(['Salt']), [])
    expect(toAdd.map((s) => s.name)).toContain('Salt')
    expect(toRemove).toEqual([])
  })

  it('removes deselected staples that are still in the pantry', () => {
    const { toAdd, toRemove } = diffStaples(new Set(), [makeItem('Salt')])
    expect(toRemove).toEqual(['id-Salt'])
    expect(toAdd).toEqual([])
  })

  it('does not add a selected staple that is already in the pantry', () => {
    const { toAdd, toRemove } = diffStaples(new Set(['Salt']), [makeItem('Salt')])
    expect(toAdd).toEqual([])
    expect(toRemove).toEqual([])
  })

  it('matches pantry items to staples case-insensitively', () => {
    const { toAdd, toRemove } = diffStaples(new Set(['Salt']), [makeItem('salt')])
    expect(toAdd).toEqual([])
    expect(toRemove).toEqual([])
  })

  it('ignores pantry items that are not staples', () => {
    const { toAdd, toRemove } = diffStaples(new Set(), [makeItem('Dragonfruit')])
    expect(toAdd).toEqual([])
    expect(toRemove).toEqual([])
  })

  it('carries the staple quantity and unit through to additions', () => {
    const { toAdd } = diffStaples(new Set(['Salt']), [])
    const salt = toAdd.find((s) => s.name === 'Salt')
    expect(salt).toMatchObject({ name: 'Salt', quantity: 1, unit: 'box' })
  })
})
