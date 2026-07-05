import { useCallback, useEffect, useRef, useState } from 'react'
import recipesService from '@/services/recipes.service'
import ttsService from '@/services/tts.service'
import { CookingBriefSegment } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'

const COUNTDOWN_MS = 3000

export type CookingModeStatus = 'idle' | 'countdown' | 'loading' | 'playing' | 'paused' | 'done'

interface CookingModeState {
  steps: CookingBriefSegment[]
  cache: Map<number, string>
  audio: HTMLAudioElement | null
  stopped: boolean
  currentIndex: number
  readyToPlay: boolean
  countdownDone: boolean
}

type WakeLockHandle = { release: () => Promise<void> }
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: string) => Promise<WakeLockHandle> }
}

export interface UseCookingModeReturn {
  status: CookingModeStatus
  currentStepIndex: number
  currentStep: CookingBriefSegment | null
  totalSteps: number
  start: () => Promise<void>
  skipCountdown: () => void
  pause: () => void
  resume: () => void
  replay: () => void
  next: () => void
  prev: () => void
  exit: () => void
}

export const useCookingMode = (recipeId: string | undefined): UseCookingModeReturn => {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<CookingModeStatus>('idle')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const stateRef = useRef<CookingModeState>({
    steps: [],
    cache: new Map(),
    audio: null,
    stopped: false,
    currentIndex: 0,
    readyToPlay: false,
    countdownDone: false,
  })

  const wakeLockRef = useRef<WakeLockHandle | null>(null)
  const playStepRef = useRef<(index: number) => void>(() => {})
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopAudio = useCallback(() => {
    const { audio } = stateRef.current
    if (audio) {
      audio.pause()
      audio.onended = null
      stateRef.current.audio = null
    }
  }, [])

  const clearLocalCache = useCallback(() => {
    stateRef.current.cache.clear()
  }, [])

  const prefetchAll = useCallback((steps: CookingBriefSegment[]) => {
    steps.forEach((step, index) => {
      const state = stateRef.current
      if (state.stopped || state.cache.has(index)) return
      ttsService
        .fetchAudio(step.text)
        .then((url) => {
          if (!stateRef.current.stopped) stateRef.current.cache.set(index, url)
        })
        .catch(() => {})
    })
  }, [])

  const playStep = useCallback(
    (index: number) => {
      const state = stateRef.current
      if (state.stopped || index >= state.steps.length) return

      state.currentIndex = index
      setCurrentStepIndex(index)

      const play = (url: string) => {
        if (stateRef.current.stopped) return
        stopAudio()
        const audio = new Audio(url)
        stateRef.current.audio = audio
        audio.onended = () => {
          if (!stateRef.current.stopped) setStatus('paused')
        }
        audio.play()
        setStatus('playing')
        // Start background prefetch for remaining steps once step 0 begins playing,
        // so step 0's TTS request is served before any prefetch hits the server.
        if (index === 0) prefetchAll(stateRef.current.steps)
      }

      const cached = state.cache.get(index)
      if (cached) {
        play(cached)
      } else {
        setStatus('loading')
        ttsService
          .fetchAudio(state.steps[index].text)
          .then((url) => {
            if (stateRef.current.stopped) return
            stateRef.current.cache.set(index, url)
            play(url)
          })
          .catch(() => {
            if (!stateRef.current.stopped) setStatus('paused')
          })
      }
    },
    [stopAudio, prefetchAll]
  )

  playStepRef.current = playStep

  const start = useCallback(async () => {
    if (!recipeId) return
    const state = stateRef.current
    state.stopped = false
    state.currentIndex = 0
    state.readyToPlay = false
    state.countdownDone = false
    clearLocalCache()
    setStatus('countdown')
    setCurrentStepIndex(0)

    const nav = navigator as WakeLockNavigator
    if (nav.wakeLock) {
      nav.wakeLock
        .request('screen')
        .then((lock) => { wakeLockRef.current = lock })
        .catch(() => {})
    }

    // After COUNTDOWN_MS, launch the cook-along regardless of audio readiness.
    countdownTimerRef.current = setTimeout(() => {
      if (stateRef.current.stopped) return
      stateRef.current.countdownDone = true
      if (stateRef.current.readyToPlay) {
        playStepRef.current(0)
      } else {
        // Audio still loading — show the indicator and let the fetch chain launch playback.
        setStatus('loading')
      }
    }, COUNTDOWN_MS)

    try {
      // Fetch brief (instant from cache) + step 0 audio during the countdown window.
      const brief = await recipesService.getCookingBrief(recipeId)
      if (state.stopped) return
      const steps = brief.segments.filter((seg) => seg.type === 'step')
      state.steps = steps
      if (steps.length === 0) {
        if (countdownTimerRef.current !== null) clearTimeout(countdownTimerRef.current)
        setStatus('done')
        return
      }
      const url = await ttsService.fetchAudio(steps[0].text)
      if (state.stopped) return
      state.cache.set(0, url)
      state.readyToPlay = true
      if (state.countdownDone) {
        // Countdown already elapsed (or was skipped) — start playing immediately.
        playStepRef.current(0)
      }
      // else: the timer fires at COUNTDOWN_MS and calls playStepRef.current(0).
    } catch {
      if (!state.stopped) {
        if (countdownTimerRef.current !== null) clearTimeout(countdownTimerRef.current)
        setStatus('idle')
        dispatch(
          setNotification({
            message: "Couldn't start cooking mode. Please try again.",
            type: 'error',
          })
        )
      }
    }
  }, [recipeId, dispatch, clearLocalCache])

  const skipCountdown = useCallback(() => {
    const state = stateRef.current
    if (state.stopped) return
    if (countdownTimerRef.current !== null) clearTimeout(countdownTimerRef.current)
    state.countdownDone = true
    if (state.readyToPlay) {
      playStepRef.current(0)
    } else {
      setStatus('loading')
    }
  }, [])

  const pause = useCallback(() => {
    stateRef.current.audio?.pause()
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    stateRef.current.audio?.play()
    setStatus('playing')
  }, [])

  const replay = useCallback(() => {
    playStepRef.current(stateRef.current.currentIndex)
  }, [])

  const next = useCallback(() => {
    const nextIndex = stateRef.current.currentIndex + 1
    if (nextIndex >= stateRef.current.steps.length) {
      stopAudio()
      setStatus('done')
      return
    }
    playStepRef.current(nextIndex)
  }, [stopAudio])

  const prev = useCallback(() => {
    const prevIndex = Math.max(0, stateRef.current.currentIndex - 1)
    playStepRef.current(prevIndex)
  }, [])

  const exit = useCallback(() => {
    if (countdownTimerRef.current !== null) clearTimeout(countdownTimerRef.current)
    stateRef.current.stopped = true
    stateRef.current.readyToPlay = false
    stateRef.current.countdownDone = false
    stopAudio()
    clearLocalCache()
    stateRef.current.steps = []
    stateRef.current.currentIndex = 0
    setStatus('idle')
    setCurrentStepIndex(0)
    wakeLockRef.current?.release().catch(() => {})
    wakeLockRef.current = null
  }, [stopAudio, clearLocalCache])

  useEffect(() => {
    const state = stateRef.current
    const wl = wakeLockRef
    const timer = countdownTimerRef
    return () => {
      state.stopped = true
      if (timer.current !== null) clearTimeout(timer.current)
      if (state.audio) {
        state.audio.pause()
        state.audio.onended = null
        state.audio = null
      }
      state.cache.clear()
      wl.current?.release().catch(() => {})
      wl.current = null
    }
  }, [])

  const steps = stateRef.current.steps
  const currentStep = steps[currentStepIndex] ?? null
  const totalSteps = steps.length

  return {
    status,
    currentStepIndex,
    currentStep,
    totalSteps,
    start,
    skipCountdown,
    pause,
    resume,
    replay,
    next,
    prev,
    exit,
  }
}
