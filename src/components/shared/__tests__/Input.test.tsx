import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Input from '@components/shared/Input/Input'

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<Input label="Password" helperText="Min 8 characters" />)
    expect(screen.getByText(/min 8 characters/i)).toBeInTheDocument()
  })

  it('shows required indicator', () => {
    render(<Input label="Name" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('disables input when disabled prop is true', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('accepts placeholder', () => {
    render(<Input placeholder="Enter text..." />)
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument()
  })
})
