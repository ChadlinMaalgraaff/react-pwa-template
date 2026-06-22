import { describe, it, expect } from 'vitest'
import {
  STAPLES,
  COMMON_STAPLES,
  MORE_STAPLES,
  STAPLE_CATEGORIES,
  groupStaplesByCategory,
} from '@components/pantry/PantryStaplesSection/staples'

describe('staples data', () => {
  it('has unique staple names', () => {
    const names = STAPLES.map((staple) => staple.name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('partitions every staple into exactly one of common or more', () => {
    expect(COMMON_STAPLES.length + MORE_STAPLES.length).toBe(STAPLES.length)
    const commonNames = new Set(COMMON_STAPLES.map((staple) => staple.name))
    expect(MORE_STAPLES.some((staple) => commonNames.has(staple.name))).toBe(false)
  })

  it('marks common staples with the common flag and more staples without it', () => {
    expect(COMMON_STAPLES.every((staple) => staple.common === true)).toBe(true)
    expect(MORE_STAPLES.every((staple) => !staple.common)).toBe(true)
  })

  it('gives every staple a positive quantity', () => {
    expect(STAPLES.every((staple) => staple.quantity > 0)).toBe(true)
  })

  it('assigns every staple a known category', () => {
    expect(STAPLES.every((staple) => STAPLE_CATEGORIES.includes(staple.category))).toBe(true)
  })
})

describe('groupStaplesByCategory', () => {
  it('groups staples in canonical category order', () => {
    const groups = groupStaplesByCategory(STAPLES)
    const order = groups.map(([category]) => category)
    expect(order).toEqual([...STAPLE_CATEGORIES])
  })

  it('places every staple under its own category', () => {
    const groups = groupStaplesByCategory(STAPLES)
    groups.forEach(([category, staples]) => {
      expect(staples.every((staple) => staple.category === category)).toBe(true)
    })
    const total = groups.reduce((sum, [, staples]) => sum + staples.length, 0)
    expect(total).toBe(STAPLES.length)
  })

  it('omits categories with no staples in the provided list', () => {
    const groups = groupStaplesByCategory(COMMON_STAPLES)
    const categories = groups.map(([category]) => category)
    // Stock has no common staples, so its heading should not appear up-front.
    expect(categories).not.toContain('Stock')
    expect(groups.every(([, staples]) => staples.length > 0)).toBe(true)
  })
})
