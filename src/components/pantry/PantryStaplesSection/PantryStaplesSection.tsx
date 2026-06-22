import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react'
import { PantryItem } from '@/types/pantry.types'
import { STAPLES, Staple, groupStaplesByCategory } from './staples'
import './PantryStaplesSection.css'

interface PantryStaplesSectionProps {
  items: PantryItem[]
  onAdd: (name: string, quantity: number, unit: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
  defaultExpanded?: boolean
}

const PantryStaplesSection = ({ items, onAdd, onRemove, defaultExpanded = false }: PantryStaplesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const findPantryItem = (stapleName: string): PantryItem | undefined =>
    items.find((item) => item.ingredientName.toLowerCase() === stapleName.toLowerCase())

  const handleToggle = async (stapleName: string, quantity: number, unit: string) => {
    if (pending.has(stapleName)) return
    const existingItem = findPantryItem(stapleName)
    setPending((prev) => new Set(prev).add(stapleName))
    try {
      if (existingItem) {
        await onRemove(existingItem.id)
      } else {
        await onAdd(stapleName, quantity, unit)
      }
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(stapleName)
        return next
      })
    }
  }

  const renderChip = (staple: Staple) => {
    const inPantry = !!findPantryItem(staple.name)
    const isLoading = pending.has(staple.name)
    return (
      <button
        key={staple.name}
        type="button"
        aria-label={`${inPantry ? 'Remove' : 'Add'} ${staple.name}`}
        aria-pressed={inPantry}
        disabled={isLoading}
        className={`pantry-staple-chip${inPantry ? ' pantry-staple-chip--active' : ''}`}
        onClick={() => handleToggle(staple.name, staple.quantity, staple.unit)}
      >
        {inPantry ? (
          <Check className="h-3.5 w-3.5 flex-none" />
        ) : (
          <Plus className="h-3.5 w-3.5 flex-none" />
        )}
        {staple.name}
      </button>
    )
  }

  return (
    <div className="pantry-staples">
      <button
        type="button"
        className="pantry-staples-toggle"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <span className="pantry-staples-heading">Staples</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-ink-mute" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-mute" />
        )}
      </button>

      {isExpanded && (
        <div className="pantry-staples-body">
          <p className="pantry-staples-hint">
            Tap to mark what you usually have. These count toward recipe matching.
          </p>
          <div className="pantry-staples-groups">
            {groupStaplesByCategory(STAPLES).map(([category, staples]) => (
              <section key={category} className="pantry-staples-group">
                <h3 className="pantry-staples-group-title">{category}</h3>
                <div className="pantry-staples-chips">{staples.map(renderChip)}</div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PantryStaplesSection
