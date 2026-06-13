import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ComingSoon from '@components/pages/ComingSoon/ComingSoon'

describe('ComingSoon Page', () => {
  it('renders the given title', () => {
    render(<ComingSoon title="Login" />)
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('This screen is coming soon.')).toBeInTheDocument()
  })
})
