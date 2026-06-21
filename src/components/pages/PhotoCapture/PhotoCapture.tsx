import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '@components/shared'
import { PhotoCaptureFrame } from '@components/pantry'
import { usePantryCapture } from '@hooks/usePantryCapture'
import './PhotoCapture.css'

const PhotoCapture = () => {
  const navigate = useNavigate()
  const { upload, analyze, isUploading, isAnalyzing } = usePantryCapture()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCapture = async (file: File) => {
    setErrorMessage(null)
    try {
      const key = await upload(file)
      const { suggestions } = await analyze(key)
      navigate('/pantry/capture/review', { state: { suggestions } })
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  const isBusy = isUploading || isAnalyzing

  return (
    <div className="photo-capture-page">
      <button type="button" aria-label="Close" className="photo-capture-close" onClick={() => navigate('/pantry')}>
        <ArrowLeft className="h-6 w-6" />
      </button>

      {isBusy ? (
        <div className="photo-capture-status">
          <Spinner size="lg" />
          <p>Scanning your pantry…</p>
        </div>
      ) : (
        <PhotoCaptureFrame onCapture={handleCapture} />
      )}

      {errorMessage && <p role="alert" className="photo-capture-error">{errorMessage}</p>}
    </div>
  )
}

export default PhotoCapture
