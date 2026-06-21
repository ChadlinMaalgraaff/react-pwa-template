import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoCaptureFrame from '@components/pantry/PhotoCaptureFrame/PhotoCaptureFrame'

describe('PhotoCaptureFrame Component', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  })

  it('renders the upload prompt initially', () => {
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)
    expect(screen.getByText('Scan your pantry')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Use Photo' })).not.toBeInTheDocument()
  })

  it('shows a preview and action buttons after selecting a file', async () => {
    const user = userEvent.setup()
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)

    expect(screen.getByAltText('Captured pantry items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Use Photo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retake' })).toBeInTheDocument()
  })

  it('calls onCapture with the selected file when Use Photo is clicked', async () => {
    const user = userEvent.setup()
    const handleCapture = vi.fn()
    render(<PhotoCaptureFrame onCapture={handleCapture} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Use Photo' }))

    expect(handleCapture).toHaveBeenCalledWith(file)
  })

  it('returns to the upload prompt when Retake is clicked', async () => {
    const user = userEvent.setup()
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Retake' }))

    expect(screen.getByText('Scan your pantry')).toBeInTheDocument()
  })
})
