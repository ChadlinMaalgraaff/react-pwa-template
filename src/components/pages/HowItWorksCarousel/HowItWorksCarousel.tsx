import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@components/shared'
import './HowItWorksCarousel.css'

export const ONBOARDING_STORAGE_KEY = 'onboarding_seen_v1'

const SLIDES = [
  {
    img: '/onboarding/slide_1.png',
    alt: 'Taking a photo of a fridge to log ingredients automatically',
    headline: 'Just take a photo of your fridge',
    body: "Open the camera, snap a quick pic of your fridge or whatever food you've got at home, and What's Lekker? picks everything up automatically. No typing, no long lists — just a photo and you're sorted.",
  },
  {
    img: '/onboarding/slide_2.png',
    alt: 'Recipe matching screen showing meals you can cook today',
    headline: 'See what you can cook right now',
    body: "Tap Cook Now and we'll show you recipes you can actually make today — using only the food you've already got at home. No extra shopping needed, no wasted ingredients.",
  },
  {
    img: '/onboarding/slide_3.png',
    alt: 'Recipe browse grid featuring South African dishes',
    headline: 'Find something lekker to make',
    body: "Browse hundreds of South African and international recipes — from quick weeknight meals to braai classics. Filter by how much time you've got, the type of meal you're after, or see what's on special near you this week.",
  },
]

const HowItWorksCarousel = () => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef<number>(0)

  const isLastSlide = currentIndex === SLIDES.length - 1
  const slide = SLIDES[currentIndex]

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    navigate('/staples')
  }

  const advance = () => {
    if (isLastSlide) {
      dismiss()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -50 && currentIndex < SLIDES.length - 1) setCurrentIndex((i) => i + 1)
    if (delta > 50 && currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  return (
    <div
      className="carousel-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img src={slide.img} alt={slide.alt} className="carousel-image" />

      <div className="carousel-content">
        <div className="carousel-dots" aria-hidden="true">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={i === currentIndex ? 'carousel-dot carousel-dot-active' : 'carousel-dot'}
            />
          ))}
        </div>

        <h1 className="carousel-headline">{slide.headline}</h1>
        <p className="carousel-body">{slide.body}</p>

        <div className="carousel-actions">
          <Button onClick={advance} className="w-full">
            {isLastSlide ? "Let's go" : 'Next'}
          </Button>
          {!isLastSlide && (
            <button type="button" className="carousel-skip" onClick={dismiss}>
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default HowItWorksCarousel
