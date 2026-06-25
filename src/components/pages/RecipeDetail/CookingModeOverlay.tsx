import { useEffect, useRef, useState } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Pause,
  Play,
  CheckCircle2,
} from 'lucide-react'
import { Button, Spinner } from '@components/shared'
import { UseCookingModeReturn } from '@hooks/useCookingMode'
import './CookingModeOverlay.css'

interface CookingModeOverlayProps {
  instructions: string[]
  recipeTitle: string
  mode: UseCookingModeReturn
  onMarkCooked: () => void
}

const CookingModeOverlay = ({
  instructions,
  recipeTitle,
  mode,
  onMarkCooked,
}: CookingModeOverlayProps) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [count, setCount] = useState(3)

  // Tick the countdown display 3 → 2 → 1 while status is 'countdown'.
  useEffect(() => {
    if (mode.status !== 'countdown') {
      setCount(3)
      return
    }
    setCount(3)
    const id = setInterval(() => setCount((c) => Math.max(1, c - 1)), 1000)
    return () => clearInterval(id)
  }, [mode.status])

  useEffect(() => {
    if (mode.status === 'idle' || mode.status === 'countdown') return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { mode.exit(); return }
      if (e.key === 'ArrowRight') { mode.next(); return }
      if (e.key === 'ArrowLeft') { mode.prev(); return }
      if (e.key === ' ') {
        e.preventDefault()
        if (mode.status === 'playing') mode.pause()
        else if (mode.status === 'paused') mode.resume()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mode])

  if (mode.status === 'idle') return null

  // Countdown screen
  if (mode.status === 'countdown') {
    return (
      <div className="cooking-mode-overlay" role="dialog" aria-modal="true" aria-label="Cooking mode">
        <div className="cooking-mode-topbar">
          <button
            type="button"
            aria-label="Exit cooking mode"
            className="cooking-mode-exit-btn"
            onClick={mode.exit}
          >
            <X className="h-5 w-5" />
            <span>Exit</span>
          </button>
        </div>

        <div className="cooking-mode-countdown">
          <div className="cooking-mode-countdown-ring-wrap">
            <svg viewBox="0 0 100 100" className="cooking-mode-countdown-svg" aria-hidden="true">
              <circle className="cooking-mode-countdown-track" cx="50" cy="50" r="40" />
              <circle className="cooking-mode-countdown-fill" cx="50" cy="50" r="40" />
            </svg>
            <span key={count} className="cooking-mode-countdown-num" aria-live="polite" aria-atomic="true">
              {count}
            </span>
          </div>
          <p className="cooking-mode-countdown-label">Get ready to cook!</p>
          <p className="cooking-mode-countdown-recipe">{recipeTitle}</p>
        </div>

        <div className="cooking-mode-countdown-footer">
          <button
            type="button"
            className="cooking-mode-skip-btn"
            onClick={mode.skipCountdown}
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  // Completion screen
  if (mode.status === 'done') {
    return (
      <div className="cooking-mode-overlay" role="dialog" aria-modal="true" aria-label="Cooking mode">
        <div className="cooking-mode-done">
          <div className="cooking-mode-done-check">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="cooking-mode-done-title">You cooked it!</h2>
            <p className="cooking-mode-done-subtitle">{recipeTitle}</p>
          </div>
          <div className="cooking-mode-done-actions">
            <Button
              onClick={() => { mode.exit(); onMarkCooked() }}
              className="w-full"
            >
              I made this
            </Button>
            <Button variant="secondary" onClick={mode.exit} className="w-full">
              Just exit
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const rawStep = instructions[mode.currentStepIndex] ?? ''
  // Before the brief resolves totalSteps is 0 — fall back to the instructions prop length
  // so the progress bar and dots are correct from the moment the overlay opens.
  const effectiveTotalSteps = mode.totalSteps > 0 ? mode.totalSteps : instructions.length
  const progress =
    effectiveTotalSteps > 0 ? ((mode.currentStepIndex + 1) / effectiveTotalSteps) * 100 : 0
  const showDots = effectiveTotalSteps > 0 && effectiveTotalSteps <= 12

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    touchStartRef.current = null
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0) mode.next()
    else mode.prev()
  }

  return (
    <div
      className="cooking-mode-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Cooking mode"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <div className="cooking-mode-topbar">
        <button
          type="button"
          aria-label="Exit cooking mode"
          className="cooking-mode-exit-btn"
          onClick={mode.exit}
        >
          <X className="h-5 w-5" />
          <span>Exit</span>
        </button>
        <span className="cooking-mode-position" aria-live="polite">
          {mode.currentStepIndex + 1} / {effectiveTotalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="cooking-mode-progress-track" role="progressbar" aria-valuenow={mode.currentStepIndex + 1} aria-valuemin={1} aria-valuemax={effectiveTotalSteps}>
        <div
          className="cooking-mode-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      {showDots && (
        <div className="cooking-mode-dots" aria-hidden="true">
          {Array.from({ length: effectiveTotalSteps }).map((_, i) => (
            <span
              key={i}
              className={
                i === mode.currentStepIndex
                  ? 'cooking-mode-dot cooking-mode-dot--active'
                  : i < mode.currentStepIndex
                    ? 'cooking-mode-dot cooking-mode-dot--done'
                    : 'cooking-mode-dot'
              }
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="cooking-mode-content">
        <p className="cooking-mode-step-num">Step {mode.currentStepIndex + 1}</p>
        <p className="cooking-mode-step-text">{rawStep}</p>
      </div>

      {/* Audio status */}
      <div className="cooking-mode-audio-row">
        {mode.status === 'playing' && (
          <div className="cooking-mode-wave" aria-label="Playing audio">
            <span className="cooking-mode-wave-bar" />
            <span className="cooking-mode-wave-bar" />
            <span className="cooking-mode-wave-bar" />
            <span className="cooking-mode-wave-bar" />
            <span className="cooking-mode-wave-bar" />
          </div>
        )}
        {(mode.status === 'paused') && (
          <span className="cooking-mode-audio-hint">Tap play to hear this step again</span>
        )}
        {mode.status === 'loading' && (
          <span className="cooking-mode-audio-hint">Loading audio…</span>
        )}
      </div>

      {/* Controls */}
      <div className="cooking-mode-controls">
        <button
          type="button"
          aria-label="Previous step"
          className="cooking-mode-ctrl cooking-mode-ctrl--icon"
          onClick={mode.prev}
          disabled={mode.currentStepIndex === 0}
        >
          <ChevronLeft className="h-7 w-7" />
        </button>

        <div className="cooking-mode-center-controls">
          <button
            type="button"
            aria-label="Replay step"
            className="cooking-mode-ctrl cooking-mode-ctrl--icon"
            onClick={mode.replay}
            disabled={mode.status === 'loading'}
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          {mode.status === 'playing' ? (
            <button
              type="button"
              aria-label="Pause"
              className="cooking-mode-ctrl cooking-mode-ctrl--play"
              onClick={mode.pause}
            >
              <Pause className="h-7 w-7" />
            </button>
          ) : (
            <button
              type="button"
              aria-label={mode.status === 'loading' ? 'Loading audio' : 'Play step'}
              className="cooking-mode-ctrl cooking-mode-ctrl--play"
              onClick={mode.resume}
              disabled={mode.status === 'loading'}
            >
              {mode.status === 'loading' && mode.totalSteps > 0 ? (
                <Spinner size="sm" />
              ) : (
                <Play className="h-7 w-7" />
              )}
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Next step"
          className="cooking-mode-ctrl cooking-mode-ctrl--icon"
          onClick={mode.next}
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>
    </div>
  )
}

export default CookingModeOverlay
