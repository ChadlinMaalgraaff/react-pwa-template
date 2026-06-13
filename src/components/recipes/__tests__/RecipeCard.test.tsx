import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RecipeCard from '@components/recipes/RecipeCard/RecipeCard'

describe('RecipeCard Component', () => {
  it('renders the title, cuisine, time, and servings', () => {
    render(
      <RecipeCard
        title="Bobotie"
        imageUrl="https://example.com/bobotie.jpg"
        cuisine="South African"
        prepTimeMinutes={20}
        cookTimeMinutes={40}
        servings={4}
      />
    )
    expect(screen.getByText('Bobotie')).toBeInTheDocument()
    expect(screen.getByText('South African')).toBeInTheDocument()
    expect(screen.getByText('60 min')).toBeInTheDocument()
    expect(screen.getByText('4 servings')).toBeInTheDocument()
    expect(screen.getByAltText('Bobotie')).toBeInTheDocument()
  })

  it('shows a "Makeable" badge when fully makeable', () => {
    render(
      <RecipeCard
        title="Bobotie"
        imageUrl={null}
        matchInfo={{ isFullyMakeable: true, missingCount: 0 }}
      />
    )
    expect(screen.getByText('Makeable')).toBeInTheDocument()
  })

  it('shows a "Missing N" badge when not fully makeable', () => {
    render(
      <RecipeCard
        title="Bobotie"
        imageUrl={null}
        matchInfo={{ isFullyMakeable: false, missingCount: 2 }}
      />
    )
    expect(screen.getByText('Missing 2')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<RecipeCard title="Bobotie" imageUrl={null} onClick={handleClick} />)
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })

  it('does not render as a button when onClick is not provided', () => {
    render(<RecipeCard title="Bobotie" imageUrl={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
