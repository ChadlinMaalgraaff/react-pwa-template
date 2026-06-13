import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuantityStepper from '@components/shared/QuantityStepper/QuantityStepper'

describe('QuantityStepper Component', () => {
  it('renders the current value and unit', () => {
    render(<QuantityStepper value={2} unit="kg" onChange={vi.fn()} />)
    expect(screen.getByText('2 kg')).toBeInTheDocument()
  })

  it('calls onChange with an incremented value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<QuantityStepper value={2} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(handleChange).toHaveBeenCalledWith(3)
  })

  it('calls onChange with a decremented value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<QuantityStepper value={2} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    expect(handleChange).toHaveBeenCalledWith(1)
  })

  it('disables the decrement button at the minimum', () => {
    render(<QuantityStepper value={0} min={0} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
  })

  it('disables the increment button at the maximum', () => {
    render(<QuantityStepper value={5} max={5} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
  })
})
