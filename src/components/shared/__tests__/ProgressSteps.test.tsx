import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressSteps from '@components/shared/ProgressSteps/ProgressSteps'

describe('ProgressSteps Component', () => {
  const steps = ['Capture', 'Review', 'Confirm']

  it('renders all step labels', () => {
    render(<ProgressSteps steps={steps} currentStep={1} />)
    steps.forEach((step) => expect(screen.getByText(step)).toBeInTheDocument())
  })

  it('marks the current step', () => {
    render(<ProgressSteps steps={steps} currentStep={2} />)
    expect(screen.getByText('Review').previousSibling).toHaveAttribute('aria-current', 'step')
  })

  it('marks earlier steps as complete', () => {
    const { container } = render(<ProgressSteps steps={steps} currentStep={3} />)
    const completedConnectors = container.querySelectorAll('.bg-primary')
    expect(completedConnectors.length).toBeGreaterThan(0)
  })
})
