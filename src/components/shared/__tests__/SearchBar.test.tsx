import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '@components/shared/SearchBar/SearchBar'

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with a placeholder', () => {
    render(<SearchBar placeholder="Search recipes" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search recipes')).toBeInTheDocument()
  })

  it('debounces onSearch calls', async () => {
    const user = userEvent.setup({ delay: null })
    const handleSearch = vi.fn()
    render(<SearchBar onSearch={handleSearch} />)

    const input = screen.getByRole('searchbox')
    await user.type(input, 'rice')

    expect(handleSearch).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(handleSearch).toHaveBeenCalledWith('rice')
    expect(handleSearch).toHaveBeenCalledTimes(1)
  })

  it('renders an optional filter action', () => {
    render(<SearchBar onSearch={vi.fn()} filterAction={<button>Filters</button>} />)
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument()
  })
})
