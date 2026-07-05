import { describe, it, expect } from 'vitest'
import {
  NUTRITION_COMPARATORS,
  NutritionFields,
  seededShuffle,
  getSessionShuffleSeed,
} from '@utils/recipeSort'

const make = (overrides: NutritionFields & { id: string }) => overrides

const a = make({ id: 'a', calories: 600, protein: 40, fat: 5, carbs: 20 })
const b = make({ id: 'b', calories: 300, protein: 10, fat: 30, carbs: 50 })
const c = make({ id: 'c' }) // un-enriched: no nutrition

describe('recipeSort', () => {
  it('sorts by highest protein, with un-enriched recipes last', () => {
    const sorted = [c, b, a].sort(NUTRITION_COMPARATORS.protein).map((r) => r.id)
    expect(sorted).toEqual(['a', 'b', 'c'])
  })

  it('sorts by lightest (fewest calories), with un-enriched recipes last', () => {
    const sorted = [c, a, b].sort(NUTRITION_COMPARATORS.light).map((r) => r.id)
    expect(sorted).toEqual(['b', 'a', 'c'])
  })

  it('sorts by lowest carb', () => {
    const sorted = [b, a].sort(NUTRITION_COMPARATORS['low-carb']).map((r) => r.id)
    expect(sorted).toEqual(['a', 'b'])
  })

  it('sorts by lowest fat', () => {
    const sorted = [b, a].sort(NUTRITION_COMPARATORS['low-fat']).map((r) => r.id)
    expect(sorted).toEqual(['a', 'b'])
  })

  it('sorts by most filling (highest calories)', () => {
    const sorted = [b, a].sort(NUTRITION_COMPARATORS.filling).map((r) => r.id)
    expect(sorted).toEqual(['a', 'b'])
  })

  it('seededShuffle is deterministic for the same seed and does not mutate input', () => {
    const input = [a, b, c]
    const first = seededShuffle(input, 123).map((r) => r.id)
    const second = seededShuffle(input, 123).map((r) => r.id)
    expect(first).toEqual(second)
    expect(input.map((r) => r.id)).toEqual(['a', 'b', 'c'])
    expect([...first].sort()).toEqual(['a', 'b', 'c'])
  })

  it('getSessionShuffleSeed persists and reuses the seed for a key', () => {
    sessionStorage.clear()
    const seed = getSessionShuffleSeed('test-seed')
    expect(getSessionShuffleSeed('test-seed')).toBe(seed)
    expect(Number(sessionStorage.getItem('test-seed'))).toBe(seed)
  })
})
