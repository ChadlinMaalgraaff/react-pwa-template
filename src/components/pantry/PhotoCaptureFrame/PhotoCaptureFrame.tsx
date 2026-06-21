import { useRef, useState, ChangeEvent } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '@components/shared'
import './PhotoCaptureFrame.css'

interface PhotoCaptureFrameProps {
  onCapture: (file: File) => void
}

const PhotoCaptureFrame = ({ onCapture }: PhotoCaptureFrameProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  const handleRetake = () => {
    setFile(null)
    setPreviewUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleUsePhoto = () => {
    if (file) {
      onCapture(file)
    }
  }

  return (
    <div className="photo-capture-frame">
      {previewUrl ? (
        <img src={previewUrl} alt="Captured pantry items" className="photo-capture-preview" />
      ) : (
        <label className="photo-capture-placeholder">
          <Camera className="h-12 w-12 text-neutral-400" />
          <span className="photo-capture-placeholder-title">Scan your pantry</span>
          <span className="photo-capture-placeholder-tip">
            Point at your shelf or lay items flat — we&apos;ll identify what you have.
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Take or upload a photo"
          />
        </label>
      )}
      {previewUrl && (
        <div className="photo-capture-actions">
          <Button variant="secondary" onClick={handleRetake}>
            Retake
          </Button>
          <Button variant="primary" onClick={handleUsePhoto}>
            Use Photo
          </Button>
        </div>
      )}
    </div>
  )
}

export default PhotoCaptureFrame
