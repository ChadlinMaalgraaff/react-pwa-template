import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { Button, Spinner } from '@components/shared'
import { usePantry } from '@hooks/usePantry'
import {
  COMMON_STAPLES,
  DEFAULT_STAPLE_NAMES,
  MORE_STAPLES,
  STAPLES,
  Staple,
  groupStaplesByCategory,
} from '@components/pantry/PantryStaplesSection/staples'
import { diffStaples } from './diffStaples'
import './StaplesCheckIn.css'

const StaplesCheckIn = () => {
  const navigate = useNavigate()
  const { items, isLoading, addItem, removeItem } = usePantry()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const hasInteracted = useRef(false)

  // Pre-check staples already in the pantry so the user confirms and adjusts
  // rather than re-selecting from scratch. Re-seeds whenever the pantry loads,
  // but stops once the user starts toggling so their choices are never clobbered.
  // For new users with an empty pantry, seed the obvious defaults so recipe
  // matching works immediately without requiring manual setup.
  useEffect(() => {
    if (hasInteracted.current) return
    const present = new Set(
      STAPLES.filter((staple) =>
        items.some((item) => item.ingredientName.toLowerCase() === staple.name.toLowerCase())
      ).map((staple) => staple.name)
    )
    if (present.size > 0) {
      setSelected(present)
    } else if (!isLoading) {
      setSelected(new Set(DEFAULT_STAPLE_NAMES))
    }
    // Reveal the full list if any pre-checked staple lives behind "Show more",
    // so the user can always see what's already counted.
    if (MORE_STAPLES.some((staple) => present.has(staple.name))) {
      setShowAll(true)
    }
  }, [items, isLoading])

  const toggle = (name: string) => {
    hasInteracted.current = true
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const handleNext = async () => {
    setIsSaving(true)
    try {
      const { toAdd, toRemove } = diffStaples(selected, items)
      await Promise.all([
        ...toAdd.map((staple) =>
          addItem({ ingredientName: staple.name, quantity: staple.quantity, unit: staple.unit })
        ),
        ...toRemove.map((id) => removeItem(id)),
      ])
      navigate('/pantry')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = () => navigate('/pantry')

  const renderChip = (staple: Staple) => {
    const isSelected = selected.has(staple.name)
    return (
      <button
        key={staple.name}
        type="button"
        aria-label={`${isSelected ? 'Remove' : 'Add'} ${staple.name}`}
        aria-pressed={isSelected}
        className={`staples-checkin-chip${isSelected ? ' staples-checkin-chip--active' : ''}`}
        onClick={() => toggle(staple.name)}
      >
        {isSelected ? (
          <Check className="h-3.5 w-3.5 flex-none" />
        ) : (
          <Plus className="h-3.5 w-3.5 flex-none" />
        )}
        {staple.name}
      </button>
    )
  }

  if (isLoading) {
    return <Spinner fullScreen />
  }

  const visibleStaples = showAll ? STAPLES : COMMON_STAPLES
  const groups = groupStaplesByCategory(visibleStaples)

  return (
    <div className="staples-checkin-page">
      <div className="staples-checkin-card">
        <h1 className="staples-checkin-logo">What&apos;s Lekker?</h1>
        <h2 className="staples-checkin-heading">What&apos;s in your pantry today?</h2>
        <p className="staples-checkin-hint">
          Tap the staples you usually have on hand. These count toward recipe matching — keep them
          fresh and we&apos;ll suggest meals you can actually cook.
        </p>

        <div className="staples-checkin-groups">
          {groups.map(([category, staples]) => (
            <section key={category} className="staples-checkin-group">
              <h3 className="staples-checkin-group-title">{category}</h3>
              <div className="staples-checkin-chips">{staples.map(renderChip)}</div>
            </section>
          ))}
        </div>

        <button
          type="button"
          className="staples-checkin-more"
          aria-expanded={showAll}
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? (
            <>
              Show fewer
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="staples-checkin-actions">
          <button type="button" className="staples-checkin-skip" onClick={handleSkip}>
            Skip
          </button>
          <Button type="button" className="!w-auto px-8" onClick={handleNext} isLoading={isSaving}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default StaplesCheckIn
