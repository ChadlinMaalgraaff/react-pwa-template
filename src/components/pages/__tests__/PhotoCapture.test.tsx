import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import pantryService from '@/services/pantry.service'
import PhotoCapture from '@components/pages/PhotoCapture/PhotoCapture'

vi.mock('@/services/pantry.service', () => ({
  default: {
    getPhotoUploadUrl: vi.fn(),
    analyzePhoto: vi.fn(),
  },
}))

const mockedService = pantryService as unknown as Record<
  'getPhotoUploadUrl' | 'analyzePhoto',
  ReturnType<typeof vi.fn>
>

const navigateMock = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

const renderPhotoCapture = () =>
  render(
    <Provider store={buildStore()}>
      <MemoryRouter>
        <PhotoCapture />
      </MemoryRouter>
    </Provider>
  )

describe('PhotoCapture Page', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
    URL.createObjectURL = vi.fn().mockReturnValue('blob:preview')
    URL.revokeObjectURL = vi.fn()
  })

  it('navigates back to /pantry when the close button is clicked', async () => {
    const user = userEvent.setup()
    renderPhotoCapture()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry')
  })

  it('shows a per-image scanning screen while processing', async () => {
    mockedService.getPhotoUploadUrl.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ uploadUrl: 'https://upload', key: 'photo-key', expiresIn: 60 }), 100))
    )
    mockedService.analyzePhoto.mockResolvedValue({ suggestions: [] })

    const user = userEvent.setup()
    renderPhotoCapture()

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Scan 1 photo' }))

    expect(await screen.findByText('Scanning…')).toBeInTheDocument()
    expect(screen.getByText('Photo 1')).toBeInTheDocument()
  })

  it('uploads and analyzes photos then shows a review button', async () => {
    mockedService.getPhotoUploadUrl.mockResolvedValue({ uploadUrl: 'https://upload', key: 'photo-key', expiresIn: 60 })
    const suggestions = [
      { ingredientId: 'ing-1', name: 'Rice', matchedExisting: true, quantity: 1, unit: 'kg', confidence: 0.9 },
    ]
    mockedService.analyzePhoto.mockResolvedValue({ suggestions })

    const user = userEvent.setup()
    renderPhotoCapture()

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Scan 1 photo' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Review 1 items found' })).toBeInTheDocument()
    )
    await user.click(screen.getByRole('button', { name: 'Review 1 items found' }))
    expect(navigateMock).toHaveBeenCalledWith('/pantry/capture/review', { state: { suggestions } })
  })
})
