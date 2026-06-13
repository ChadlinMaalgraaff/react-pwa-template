import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import ingredientsService from '@/services/ingredients.service'
import PhotoReview from '@components/pages/PhotoReview/PhotoReview'
import { usePantry } from '@hooks/usePantry'
import { PantrySuggestion } from '@/types/pantry.types'

vi.mock('@/services/ingredients.service', () => ({
  default: {
    listIngredients: vi.fn(),
  },
}))

vi.mock('@hooks/usePantry')

const mockedUsePantry = usePantry as unknown as ReturnType<typeof vi.fn>
const mockedIngredientsService = ingredientsService as unknown as Record<'listIngredients', ReturnType<typeof vi.fn>>

const navigateMock = vi.fn()
let locationState: { suggestions?: PantrySuggestion[] } | undefined

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: '/pantry/capture/review', state: locationState }),
  }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderPhotoReview = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <PhotoReview />
      </MemoryRouter>
    </Provider>
  )

const suggestions: PantrySuggestion[] = [
  { ingredientId: 'ing-1', name: 'Rice', matchedExisting: true, quantity: 2, unit: 'kg', confidence: 0.9 },
  { ingredientId: null, name: 'Mystery Sauce', matchedExisting: false, quantity: 1, unit: 'bottle', confidence: 0.3 },
]

describe('PhotoReview Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    locationState = undefined
    mockedIngredientsService.listIngredients.mockResolvedValue([])
  })

  it('shows an empty state when there are no suggestions', () => {
    locationState = { suggestions: [] }
    mockedUsePantry.mockReturnValue({ addItem: vi.fn() })
    renderPhotoReview()
    expect(screen.getByText("We couldn't identify any items")).toBeInTheDocument()
  })

  it('renders suggestion rows with the submit button count', () => {
    locationState = { suggestions }
    mockedUsePantry.mockReturnValue({ addItem: vi.fn() })
    renderPhotoReview()
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mystery Sauce')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add 2 items to pantry' })).toBeInTheDocument()
  })

  it('removes a suggestion row when its remove button is clicked', async () => {
    locationState = { suggestions }
    mockedUsePantry.mockReturnValue({ addItem: vi.fn() })
    const user = userEvent.setup()
    renderPhotoReview()

    const removeButtons = screen.getAllByRole('button', { name: 'Remove suggestion' })
    await user.click(removeButtons[0])

    expect(screen.getByRole('button', { name: 'Add 1 items to pantry' })).toBeInTheDocument()
  })

  it('submits the suggestions and navigates to /pantry', async () => {
    locationState = { suggestions }
    const addItem = vi.fn().mockResolvedValue([])
    mockedUsePantry.mockReturnValue({ addItem })
    const user = userEvent.setup()
    renderPhotoReview()

    await user.click(screen.getByRole('button', { name: 'Add 2 items to pantry' }))

    await waitFor(() => expect(addItem).toHaveBeenCalledTimes(2))
    expect(addItem).toHaveBeenCalledWith({ ingredientId: 'ing-1', quantity: 2, unit: 'kg' })
    expect(addItem).toHaveBeenCalledWith({ ingredientName: 'Mystery Sauce', quantity: 1, unit: 'bottle' })
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/pantry'))
  })
})
