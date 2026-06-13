import { ShoppingListItem } from '@/types/shopping-lists.types'

const OTHER_ITEMS = 'Other items'

export const groupItemsByRecipe = (items: ShoppingListItem[]): Array<[string, ShoppingListItem[]]> => {
  const groups = new Map<string, ShoppingListItem[]>()

  items.forEach((item) => {
    const group = item.recipeTitle ?? OTHER_ITEMS
    const existing = groups.get(group) ?? []
    existing.push(item)
    groups.set(group, existing)
  })

  const entries = Array.from(groups.entries())
  return entries.sort(([a], [b]) => {
    if (a === OTHER_ITEMS) return 1
    if (b === OTHER_ITEMS) return -1
    return a.localeCompare(b)
  })
}
