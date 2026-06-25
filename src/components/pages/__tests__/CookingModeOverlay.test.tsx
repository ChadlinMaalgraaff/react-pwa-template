import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CookingModeOverlay from '@components/pages/RecipeDetail/CookingModeOverlay'
import { UseCookingModeReturn, CookingModeStatus } from '@hooks/useCookingMode'

const makeMode = (overrides: Partial<UseCookingModeReturn> = {}): UseCookingModeReturn => ({
  status: 'playing' as CookingModeStatus,
  currentStepIndex: 0,
  currentStep: { type: 'step', index: 1, stepIndex: 0, text: 'AI explanation for step 1' },
  totalSteps: 3,
  start: vi.fn(),
  skipCountdown: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  replay: vi.fn(),
  next: vi.fn(),
  prev: vi.fn(),
  exit: vi.fn(),
  ...overrides,
})

const INSTRUCTIONS = ['Brown the mince', 'Add spices and stir', 'Bake until set']
const TITLE = 'Bobotie'

const defaultProps = {
  instructions: INSTRUCTIONS,
  recipeTitle: TITLE,
  onMarkCooked: vi.fn(),
}

describe('CookingModeOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when status is idle', () => {
    const { container } = render(
      <CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'idle' })} />
    )
    expect(container.firstChild).toBeNull()
  })

  describe('countdown screen', () => {
    it('renders the countdown screen with a number and label', () => {
      render(<CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'countdown' })} />)
      expect(screen.getByRole('dialog', { name: 'Cooking mode' })).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Get ready to cook!')).toBeInTheDocument()
      expect(screen.getByText(TITLE)).toBeInTheDocument()
    })

    it('calls exit when the Exit button is clicked on the countdown screen', async () => {
      const mode = makeMode({ status: 'countdown' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      await userEvent.click(screen.getByRole('button', { name: 'Exit cooking mode' }))
      expect(mode.exit).toHaveBeenCalledOnce()
    })

    it('calls skipCountdown when the Skip button is clicked', async () => {
      const mode = makeMode({ status: 'countdown' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      await userEvent.click(screen.getByRole('button', { name: 'Skip' }))
      expect(mode.skipCountdown).toHaveBeenCalledOnce()
    })

    it('does not register keyboard shortcuts during countdown', () => {
      const mode = makeMode({ status: 'countdown' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(mode.next).not.toHaveBeenCalled()
    })
  })

  it('shows step content immediately when status is loading (no full-screen spinner)', () => {
    render(
      <CookingModeOverlay
        {...defaultProps}
        mode={makeMode({ status: 'loading', totalSteps: 0, currentStep: null })}
      />
    )
    // Overlay is open with raw instruction text — no full-screen loader
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(INSTRUCTIONS[0])).toBeInTheDocument()
    expect(screen.getByText('Loading audio…')).toBeInTheDocument()
  })

  it('renders the dialog with correct aria attributes', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode()} />)
    expect(screen.getByRole('dialog', { name: 'Cooking mode' })).toBeInTheDocument()
  })

  it('shows the raw step instruction text', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode()} />)
    expect(screen.getByText(INSTRUCTIONS[0])).toBeInTheDocument()
  })

  it('shows the correct step number', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode()} />)
    expect(screen.getByText('Step 1')).toBeInTheDocument()
  })

  it('shows position counter', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode()} />)
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('shows step 2 content when currentStepIndex is 1', () => {
    render(
      <CookingModeOverlay
        {...defaultProps}
        mode={makeMode({ currentStepIndex: 1 })}
      />
    )
    expect(screen.getByText('Step 2')).toBeInTheDocument()
    expect(screen.getByText(INSTRUCTIONS[1])).toBeInTheDocument()
  })

  it('shows Pause button when playing', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'playing' })} />)
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Play step' })).not.toBeInTheDocument()
  })

  it('shows Play button when paused', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'paused' })} />)
    expect(screen.getByRole('button', { name: 'Play step' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
  })

  it('shows audio hint text when paused', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'paused' })} />)
    expect(screen.getByText('Tap play to hear this step again')).toBeInTheDocument()
  })

  it('calls pause when Pause button is clicked', async () => {
    const mode = makeMode({ status: 'playing' })
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(mode.pause).toHaveBeenCalledOnce()
  })

  it('calls resume when Play button is clicked while paused', async () => {
    const mode = makeMode({ status: 'paused' })
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Play step' }))
    expect(mode.resume).toHaveBeenCalledOnce()
  })

  it('calls replay when Replay button is clicked', async () => {
    const mode = makeMode({ status: 'paused' })
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Replay step' }))
    expect(mode.replay).toHaveBeenCalledOnce()
  })

  it('calls next when Next button is clicked', async () => {
    const mode = makeMode()
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(mode.next).toHaveBeenCalledOnce()
  })

  it('calls prev when Previous button is clicked', async () => {
    const mode = makeMode({ currentStepIndex: 1 })
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Previous step' }))
    expect(mode.prev).toHaveBeenCalledOnce()
  })

  it('disables the Previous button on step 0', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ currentStepIndex: 0 })} />)
    expect(screen.getByRole('button', { name: 'Previous step' })).toBeDisabled()
  })

  it('calls exit when Exit button is clicked', async () => {
    const mode = makeMode()
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Exit cooking mode' }))
    expect(mode.exit).toHaveBeenCalledOnce()
  })

  it('shows progress bar with correct aria attributes when brief is loaded', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ currentStepIndex: 1, totalSteps: 3 })} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemax', '3')
  })

  it('falls back to instructions.length for progress bar before brief resolves', () => {
    render(
      <CookingModeOverlay
        {...defaultProps}
        mode={makeMode({ status: 'loading', totalSteps: 0, currentStep: null })}
      />
    )
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuemax', String(INSTRUCTIONS.length))
  })

  it('renders step dots for a recipe with <= 12 steps', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ totalSteps: 3 })} />)
    // 3 dots in the dots container (aria-hidden so we query differently)
    const dots = document.querySelectorAll('.cooking-mode-dot')
    expect(dots).toHaveLength(3)
  })

  it('does not render step dots for a recipe with > 12 steps', () => {
    render(
      <CookingModeOverlay
        {...defaultProps}
        instructions={Array(13).fill('step')}
        mode={makeMode({ totalSteps: 13 })}
      />
    )
    const dots = document.querySelectorAll('.cooking-mode-dot')
    expect(dots).toHaveLength(0)
  })

  it('renders the done screen when status is done', () => {
    render(<CookingModeOverlay {...defaultProps} mode={makeMode({ status: 'done' })} />)
    expect(screen.getByText('You cooked it!')).toBeInTheDocument()
    expect(screen.getByText(TITLE)).toBeInTheDocument()
  })

  it('calls exit and onMarkCooked when "I made this" is clicked on done screen', async () => {
    const mode = makeMode({ status: 'done' })
    const onMarkCooked = vi.fn()
    render(<CookingModeOverlay {...defaultProps} mode={mode} onMarkCooked={onMarkCooked} />)
    await userEvent.click(screen.getByRole('button', { name: 'I made this' }))
    expect(mode.exit).toHaveBeenCalledOnce()
    expect(onMarkCooked).toHaveBeenCalledOnce()
  })

  it('calls exit when "Just exit" is clicked on done screen', async () => {
    const mode = makeMode({ status: 'done' })
    render(<CookingModeOverlay {...defaultProps} mode={mode} />)
    await userEvent.click(screen.getByRole('button', { name: 'Just exit' }))
    expect(mode.exit).toHaveBeenCalledOnce()
  })

  describe('keyboard shortcuts', () => {
    it('calls next on ArrowRight', () => {
      const mode = makeMode()
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(mode.next).toHaveBeenCalledOnce()
    })

    it('calls prev on ArrowLeft', () => {
      const mode = makeMode()
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: 'ArrowLeft' })
      expect(mode.prev).toHaveBeenCalledOnce()
    })

    it('calls exit on Escape', () => {
      const mode = makeMode()
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mode.exit).toHaveBeenCalledOnce()
    })

    it('calls pause on Space when playing', () => {
      const mode = makeMode({ status: 'playing' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: ' ' })
      expect(mode.pause).toHaveBeenCalledOnce()
    })

    it('calls resume on Space when paused', () => {
      const mode = makeMode({ status: 'paused' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: ' ' })
      expect(mode.resume).toHaveBeenCalledOnce()
    })

    it('does not register keyboard shortcuts when status is idle', () => {
      const mode = makeMode({ status: 'idle' })
      render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(mode.next).not.toHaveBeenCalled()
    })
  })

  describe('swipe gestures', () => {
    it('calls next on left swipe', () => {
      const mode = makeMode()
      const { getByRole } = render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      const overlay = getByRole('dialog')
      fireEvent.touchStart(overlay, { touches: [{ clientX: 300, clientY: 200 }] })
      fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 220, clientY: 200 }] })
      expect(mode.next).toHaveBeenCalledOnce()
    })

    it('calls prev on right swipe', () => {
      const mode = makeMode({ currentStepIndex: 1 })
      const { getByRole } = render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      const overlay = getByRole('dialog')
      fireEvent.touchStart(overlay, { touches: [{ clientX: 100, clientY: 200 }] })
      fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 180, clientY: 200 }] })
      expect(mode.prev).toHaveBeenCalledOnce()
    })

    it('ignores swipe when vertical movement exceeds horizontal', () => {
      const mode = makeMode()
      const { getByRole } = render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      const overlay = getByRole('dialog')
      // mostly vertical swipe
      fireEvent.touchStart(overlay, { touches: [{ clientX: 200, clientY: 100 }] })
      fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 230, clientY: 200 }] })
      expect(mode.next).not.toHaveBeenCalled()
      expect(mode.prev).not.toHaveBeenCalled()
    })

    it('ignores swipe below 60px threshold', () => {
      const mode = makeMode()
      const { getByRole } = render(<CookingModeOverlay {...defaultProps} mode={mode} />)
      const overlay = getByRole('dialog')
      fireEvent.touchStart(overlay, { touches: [{ clientX: 200, clientY: 200 }] })
      fireEvent.touchEnd(overlay, { changedTouches: [{ clientX: 159, clientY: 200 }] })
      expect(mode.next).not.toHaveBeenCalled()
    })
  })
})
