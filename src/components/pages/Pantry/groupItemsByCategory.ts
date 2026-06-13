import { PantryItem } from '@/types/pantry.types'

const UNCATEGORIZED = 'Uncategorized'

export const groupItemsByCategory = (items: PantryItem[]): Array<[string, PantryItem[]]> => {
  const groups = new Map<string, PantryItem[]>()

  items.forEach((item) => {
    const category = item.category ?? UNCATEGORIZED
    const existing = groups.get(category) ?? []
    existing.push(item)
    groups.set(category, existing)
  })

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}
