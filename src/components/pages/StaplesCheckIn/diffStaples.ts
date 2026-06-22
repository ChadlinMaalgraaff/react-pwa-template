import { PantryItem } from '@/types/pantry.types'
import { STAPLES, Staple } from '@components/pantry/PantryStaplesSection/staples'

export interface StaplesDiff {
  /** Staples that are selected but not yet in the pantry. */
  toAdd: Staple[]
  /** Pantry item ids for staples that were deselected. */
  toRemove: string[]
}

/**
 * Compares the user's selected staple names against their current pantry and
 * returns the minimal set of additions and removals needed to reconcile them.
 * Pure and side-effect free so the commit logic can be unit tested in isolation.
 */
export const diffStaples = (selected: Set<string>, items: PantryItem[]): StaplesDiff => {
  const findItem = (name: string): PantryItem | undefined =>
    items.find((item) => item.ingredientName.toLowerCase() === name.toLowerCase())

  const toAdd: Staple[] = []
  const toRemove: string[] = []

  for (const staple of STAPLES) {
    const existing = findItem(staple.name)
    const isSelected = selected.has(staple.name)
    if (isSelected && !existing) {
      toAdd.push(staple)
    } else if (!isSelected && existing) {
      toRemove.push(existing.id)
    }
  }

  return { toAdd, toRemove }
}
