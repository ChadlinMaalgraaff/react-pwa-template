import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoCaptureFrame from '@components/pantry/PhotoCaptureFrame/PhotoCaptureFrame'

describe('PhotoCaptureFrame Component', () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  it('renders the upload prompt initially', () => {
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)
    expect(screen.getByText('Scan your shelf')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Scan \d+ photo/ })).not.toBeInTheDocument()
  })

  it('shows thumbnails and scan button after selecting a file', async () => {
    const user = userEvent.setup()
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)

    expect(screen.getByAltText('Photo 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Scan 1 photo' })).toBeInTheDocument()
  })

  it('calls onCapture with the selected files when scan button is clicked', async () => {
    const user = userEvent.setup()
    const handleCapture = vi.fn()
    render(<PhotoCaptureFrame onCapture={handleCapture} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Scan 1 photo' }))

    expect(handleCapture).toHaveBeenCalledWith([file])
  })

  it('returns to the upload prompt when the last photo is removed', async () => {
    const user = userEvent.setup()
    render(<PhotoCaptureFrame onCapture={vi.fn()} />)

    const file = new File(['photo'], 'pantry.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText('Take or upload a photo')
    await user.upload(input, file)
    await user.click(screen.getByRole('button', { name: 'Remove photo 1' }))

    expect(screen.getByText('Scan your shelf')).toBeInTheDocument()
  })
})
