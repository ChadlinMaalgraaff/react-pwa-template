import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tabs from '@components/shared/Tabs/Tabs'

const tabs = [
  { value: 'match', label: 'Cook Now' },
  { value: 'browse', label: 'Browse' },
]

describe('Tabs Component', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} value="match" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Cook Now' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Browse' })).toBeInTheDocument()
  })

  it('marks the active tab as selected', () => {
    render(<Tabs tabs={tabs} value="browse" onChange={vi.fn()} />)
    expect(screen.getByRole('tab', { name: 'Browse' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Cook Now' })).toHaveAttribute('aria-selected', 'false')
  })

  it('calls onChange when a tab is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Tabs tabs={tabs} value="match" onChange={handleChange} />)

    await user.click(screen.getByRole('tab', { name: 'Browse' }))
    expect(handleChange).toHaveBeenCalledWith('browse')
  })
})
