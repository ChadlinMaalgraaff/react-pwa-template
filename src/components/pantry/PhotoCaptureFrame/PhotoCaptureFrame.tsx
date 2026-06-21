import { useRef, useState, ChangeEvent } from 'react'
import { Camera, Image as ImageIcon, Plus, X } from 'lucide-react'
import { Button } from '@components/shared'
import './PhotoCaptureFrame.css'

interface PhotoCaptureFrameProps {
  onCapture: (files: File[]) => void
}

interface FilePreview {
  file: File
  previewUrl: string
}

const PhotoCaptureFrame = ({ onCapture }: PhotoCaptureFrameProps) => {
  const [previews, setPreviews] = useState<FilePreview[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    if (!selected.length) return
    const newPreviews = selected.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setPreviews((prev) => [...prev, ...newPreviews])
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="photo-capture-frame">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="sr-only"
        aria-label="Take or upload a photo"
      />

      {previews.length === 0 ? (
        <div className="photo-capture-scanwrap">
          <div className="photo-capture-viewfinder">
            <span className="photo-capture-corner photo-capture-corner--tl" />
            <span className="photo-capture-corner photo-capture-corner--tr" />
            <span className="photo-capture-corner photo-capture-corner--bl" />
            <span className="photo-capture-corner photo-capture-corner--br" />
            <Camera className="h-[54px] w-[54px] text-primary-soft" strokeWidth={1.5} />
          </div>
          <p className="photo-capture-placeholder-title">Scan your shelf</p>
          <p className="photo-capture-placeholder-tip">
            Add one or more photos — we&apos;ll identify everything you have.
          </p>
          <div className="photo-capture-actions">
            <Button variant="primary" onClick={() => inputRef.current?.click()}>
              <ImageIcon className="h-[18px] w-[18px]" />
              Add photos
            </Button>
          </div>
        </div>
      ) : (
        <div className="photo-capture-selected">
          <div className="photo-capture-grid">
            {previews.map(({ previewUrl }, index) => (
              <div key={previewUrl} className="photo-capture-thumb">
                <img src={previewUrl} alt={`Photo ${index + 1}`} className="photo-capture-thumb-img" />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  className="photo-capture-thumb-remove"
                  onClick={() => handleRemove(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="photo-capture-add-more"
              onClick={() => inputRef.current?.click()}
              aria-label="Add more photos"
            >
              <Plus className="h-6 w-6 text-ink-mute" />
            </button>
          </div>
          <div className="photo-capture-actions">
            <Button variant="primary" onClick={() => onCapture(previews.map((p) => p.file))}>
              <Camera className="h-[18px] w-[18px]" />
              Scan {previews.length} photo{previews.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoCaptureFrame
