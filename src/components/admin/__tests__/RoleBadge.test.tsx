import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RoleBadge from '@components/admin/RoleBadge/RoleBadge'

describe('RoleBadge Component', () => {
  it('renders "Admin" for the admin role', () => {
    render(<RoleBadge role="admin" />)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders "User" for the user role', () => {
    render(<RoleBadge role="user" />)
    expect(screen.getByText('User')).toBeInTheDocument()
  })
})
