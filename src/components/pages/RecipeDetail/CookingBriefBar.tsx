import { Headphones, Pause, Play, X } from 'lucide-react'
import { CookingBriefSegment } from '@/types/recipes.types'
import { BriefStatus } from '@hooks/useCookingBrief'
import './CookingBriefBar.css'

interface CookingBriefBarProps {
  activeSegment: CookingBriefSegment | null
  totalSteps: number
  status: Extract<BriefStatus, 'playing' | 'paused'>
  onPause: () => void
  onResume: () => void
  onStop: () => void
}

const getLabel = (segment: CookingBriefSegment | null, totalSteps: number): string => {
  if (!segment) return ''
  if (segment.type === 'intro') return 'Intro'
  const stepNum = (segment.stepIndex ?? 0) + 1
  return `Step ${stepNum} of ${totalSteps}`
}

const CookingBriefBar = ({
  activeSegment,
  totalSteps,
  status,
  onPause,
  onResume,
  onStop,
}: CookingBriefBarProps) => {
  const isPaused = status === 'paused'
  const label = getLabel(activeSegment, totalSteps)

  return (
    <div className="cooking-brief-bar" role="region" aria-label="Cooking brief playback">
      <div className="cooking-brief-bar-left">
        <Headphones className="cooking-brief-bar-icon" aria-hidden="true" />
        <span className="cooking-brief-bar-label">
          {isPaused ? `Paused · ${label}` : label}
        </span>
      </div>
      <div className="cooking-brief-bar-controls">
        {isPaused ? (
          <button
            type="button"
            aria-label="Resume"
            className="cooking-brief-bar-btn"
            onClick={onResume}
          >
            <Play className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Pause"
            className="cooking-brief-bar-btn"
            onClick={onPause}
          >
            <Pause className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          aria-label="Stop"
          className="cooking-brief-bar-btn"
          onClick={onStop}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default CookingBriefBar
