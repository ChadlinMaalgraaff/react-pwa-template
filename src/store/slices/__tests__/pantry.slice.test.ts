import { describe, it, expect } from 'vitest'
import pantryReducer, { setPantryItemCount } from '../pantry.slice'

describe('pantry slice', () => {
  it('returns the initial state', () => {
    expect(pantryReducer(undefined, { type: 'unknown' })).toEqual({ itemCount: 0 })
  })

  it('updates itemCount on setPantryItemCount', () => {
    const state = pantryReducer(undefined, setPantryItemCount(7))
    expect(state.itemCount).toBe(7)
  })
})
