import { useState, useRef } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/shared'
import { PhotoCaptureFrame } from '@components/pantry'
import { usePantryCapture } from '@hooks/usePantryCapture'
import { PantrySuggestion } from '@/types/pantry.types'
import './PhotoCapture.css'

type ScanStatus = 'pending' | 'scanning' | 'done' | 'error'

interface ScanItem {
  previewUrl: string
  status: ScanStatus
}

const PhotoCapture = () => {
  const navigate = useNavigate()
  const { upload, analyze } = usePantryCapture()
  const [scanItems, setScanItems] = useState<ScanItem[] | null>(null)
  const [allDone, setAllDone] = useState(false)
  const suggestionsRef = useRef<PantrySuggestion[]>([])

  const handleCapture = async (files: File[]) => {
    const items: ScanItem[] = files.map((file) => ({
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }))
    setScanItems(items)
    suggestionsRef.current = []

    for (let i = 0; i < files.length; i++) {
      setScanItems((prev) =>
        prev!.map((item, idx) => (idx === i ? { ...item, status: 'scanning' } : item))
      )
      try {
        const key = await upload(files[i])
        const { suggestions } = await analyze(key)
        suggestionsRef.current.push(...suggestions)
        setScanItems((prev) =>
          prev!.map((item, idx) => (idx === i ? { ...item, status: 'done' } : item))
        )
      } catch {
        setScanItems((prev) =>
          prev!.map((item, idx) => (idx === i ? { ...item, status: 'error' } : item))
        )
      }
    }

    setAllDone(true)
  }

  if (scanItems) {
    return (
      <div className="photo-capture-page">
        <div className="photo-capture-appbar">
          <span className="photo-capture-appbar-title">
            {allDone ? 'Scan complete' : 'Scanning…'}
          </span>
        </div>
        <div className="photo-capture-scan-list">
          {scanItems.map((item, index) => (
            <div key={index} className="photo-capture-scan-row">
              <img src={item.previewUrl} alt={`Photo ${index + 1}`} className="photo-capture-scan-thumb" />
              <span className="photo-capture-scan-name">Photo {index + 1}</span>
              <span className="photo-capture-scan-status">
                {item.status === 'pending' && <span className="photo-capture-scan-dot" />}
                {item.status === 'scanning' && (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Scanning" />
                )}
                {item.status === 'done' && (
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-label="Done" />
                )}
                {item.status === 'error' && (
                  <XCircle className="h-5 w-5 text-danger" aria-label="Error" />
                )}
              </span>
            </div>
          ))}
        </div>
        {allDone && (
          <div className="photo-capture-scan-footer">
            <Button
              onClick={() =>
                navigate('/pantry/capture/review', { state: { suggestions: suggestionsRef.current } })
              }
            >
              Review {suggestionsRef.current.length} items found
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="photo-capture-page">
      <div className="photo-capture-appbar">
        <button
          type="button"
          aria-label="Close"
          className="photo-capture-close"
          onClick={() => navigate('/pantry')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="photo-capture-appbar-title">Scan pantry</span>
      </div>
      <PhotoCaptureFrame onCapture={handleCapture} />
    </div>
  )
}

export default PhotoCapture
