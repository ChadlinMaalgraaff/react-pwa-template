import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import './BottomSheet.css'
import '@styles/shared.css'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-[rgba(28,26,22,.5)]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full max-w-lg rounded-t-sheet bg-surface px-5 pb-7 pt-3.5 shadow-pop ${className}`}
      >
        <div className="mx-auto mb-3.5 h-[5px] w-10 rounded-full bg-line-strong" />
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-bold text-ink">{title}</h2>}
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-mute hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default BottomSheet
