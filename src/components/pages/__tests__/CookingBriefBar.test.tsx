import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookingBriefBar from '@components/pages/RecipeDetail/CookingBriefBar'
import { CookingBriefSegment } from '@/types/recipes.types'

const introSegment: CookingBriefSegment = { type: 'intro', index: 0, text: 'Intro text' }
const stepSegment: CookingBriefSegment = { type: 'step', index: 1, stepIndex: 0, text: 'Brown the mince' }
const step2Segment: CookingBriefSegment = { type: 'step', index: 2, stepIndex: 2, text: 'Bake until set' }

const defaultProps = {
  totalSteps: 4,
  status: 'playing' as const,
  onPause: vi.fn(),
  onResume: vi.fn(),
  onStop: vi.fn(),
}

describe('CookingBriefBar', () => {
  it('shows "Intro" label for an intro segment', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} />)
    expect(screen.getByText('Intro')).toBeInTheDocument()
  })

  it('shows "Step N of M" for a step segment', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={stepSegment} />)
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  })

  it('uses stepIndex + 1 for the step number', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={step2Segment} />)
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument()
  })

  it('prefixes label with "Paused · " when status is paused', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} status="paused" />)
    expect(screen.getByText('Paused · Intro')).toBeInTheDocument()
  })

  it('shows Pause button when playing', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} status="playing" />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
  })

  it('shows Resume button when paused', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} status="paused" />)
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
  })

  it('calls onPause when Pause button is clicked', async () => {
    const onPause = vi.fn()
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} onPause={onPause} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('calls onResume when Resume button is clicked', async () => {
    const onResume = vi.fn()
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} status="paused" onResume={onResume} />)
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(onResume).toHaveBeenCalledOnce()
  })

  it('calls onStop when Stop button is clicked', async () => {
    const onStop = vi.fn()
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} onStop={onStop} />)
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(onStop).toHaveBeenCalledOnce()
  })

  it('has the playback region accessible label', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={introSegment} />)
    expect(screen.getByRole('region', { name: 'Cooking brief playback' })).toBeInTheDocument()
  })

  it('shows an empty label when activeSegment is null', () => {
    render(<CookingBriefBar {...defaultProps} activeSegment={null} />)
    expect(screen.queryByText('Intro')).not.toBeInTheDocument()
    expect(screen.queryByText(/Step/)).not.toBeInTheDocument()
  })
})
