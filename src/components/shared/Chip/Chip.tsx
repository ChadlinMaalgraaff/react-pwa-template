import React from 'react'
import { X } from 'lucide-react'
import './Chip.css'
import '@styles/shared.css'

interface ChipProps {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

const Chip: React.FC<ChipProps> = ({ children, selected = false, onClick, onRemove, className = '' }) => {
  const baseStyles =
    'inline-flex items-center gap-1 rounded-full px-[15px] py-[9px] text-sm font-semibold transition-colors border whitespace-nowrap'
  const stateStyles = selected
    ? 'bg-primary text-white border-primary'
    : 'bg-surface text-ink-soft border-line hover:bg-neutral-50'

  const content = (
    <>
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
          className="ml-1 inline-flex"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`${baseStyles} ${stateStyles} ${className}`}
      >
        {content}
      </button>
    )
  }

  return <span className={`${baseStyles} ${stateStyles} ${className}`}>{content}</span>
}

export default Chip
