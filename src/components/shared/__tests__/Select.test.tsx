import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Select from '@components/shared/Select/Select'

const options = [
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
]

describe('Select Component', () => {
  it('renders the label and options', () => {
    render(<Select label="Unit" options={options} />)
    expect(screen.getByLabelText('Unit')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Kilograms' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Grams' })).toBeInTheDocument()
  })

  it('renders a placeholder option when provided', () => {
    render(<Select options={options} placeholder="Select a unit" />)
    expect(screen.getByRole('option', { name: 'Select a unit' })).toBeInTheDocument()
  })

  it('calls onChange when a new option is selected', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Select label="Unit" options={options} onChange={handleChange} />)

    await user.selectOptions(screen.getByLabelText('Unit'), 'g')
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows an error message', () => {
    render(<Select label="Unit" options={options} error="Unit is required" />)
    expect(screen.getByText('Unit is required')).toBeInTheDocument()
  })
})
