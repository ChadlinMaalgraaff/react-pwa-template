import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HowItWorksCarousel, { ONBOARDING_STORAGE_KEY } from '@components/pages/HowItWorksCarousel/HowItWorksCarousel'

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const renderCarousel = () =>
  render(
    <MemoryRouter>
      <HowItWorksCarousel />
    </MemoryRouter>
  )

describe('HowItWorksCarousel', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    localStorage.clear()
  })

  it('renders slide 1 content on mount', () => {
    renderCarousel()
    expect(screen.getByRole('heading', { name: 'Just take a photo of your fridge' })).toBeInTheDocument()
    expect(screen.getByText(/snap a quick pic of your fridge/)).toBeInTheDocument()
  })

  it('renders 3 progress dots with the first active', () => {
    renderCarousel()
    const dots = document.querySelectorAll('.carousel-dot')
    expect(dots).toHaveLength(3)
    expect(dots[0]).toHaveClass('carousel-dot-active')
    expect(dots[1]).not.toHaveClass('carousel-dot-active')
    expect(dots[2]).not.toHaveClass('carousel-dot-active')
  })

  it('shows Next and Skip on slide 1', () => {
    renderCarousel()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument()
  })

  it('advances to slide 2 when Next is clicked', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'See what you can cook right now' })).toBeInTheDocument()
  })

  it('advances to slide 3 when Next is clicked twice', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('heading', { name: 'Find something lekker to make' })).toBeInTheDocument()
  })

  it('shows "Let\'s go" and hides Skip on the last slide', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByRole('button', { name: "Let's go" })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument()
  })

  it('updates the active dot as slides advance', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    const dots = document.querySelectorAll('.carousel-dot')
    expect(dots[0]).not.toHaveClass('carousel-dot-active')
    expect(dots[1]).toHaveClass('carousel-dot-active')
  })

  it('Skip sets localStorage flag and navigates to /staples', async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Skip' }))

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true')
    expect(navigateMock).toHaveBeenCalledWith('/staples')
  })

  it("Let's go sets localStorage flag and navigates to /staples", async () => {
    const user = userEvent.setup()
    renderCarousel()

    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: "Let's go" }))

    expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true')
    expect(navigateMock).toHaveBeenCalledWith('/staples')
  })
})
