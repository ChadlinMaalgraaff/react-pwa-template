import { useCallback, useEffect, useRef, useState } from 'react'
import recipesService from '@/services/recipes.service'
import ttsService from '@/services/tts.service'
import { CookingBriefSegment } from '@/types/recipes.types'
import { useAppDispatch } from './redux.hooks'
import { setNotification } from '@store/slices/ui.slice'

export type BriefStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface BriefState {
  segments: CookingBriefSegment[]
  cache: Map<number, string>
  audio: HTMLAudioElement | null
  stopped: boolean
}

export const useCookingBrief = (recipeId: string | undefined) => {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<BriefStatus>('idle')
  const [activeIndex, setActiveIndex] = useState(-1)

  const stateRef = useRef<BriefState>({
    segments: [],
    cache: new Map(),
    audio: null,
    stopped: false,
  })

  // Stable ref used for recursive self-calls inside audio.onended / catch blocks
  const playIndexRef = useRef<(index: number) => void>(() => {})

  const stopAudio = useCallback(() => {
    const { audio } = stateRef.current
    if (audio) {
      audio.pause()
      audio.onended = null
      stateRef.current.audio = null
    }
  }, [])

  const revokeAll = useCallback(() => {
    stateRef.current.cache.forEach((url) => URL.revokeObjectURL(url))
    stateRef.current.cache.clear()
  }, [])

  const prefetch = useCallback((index: number) => {
    const s = stateRef.current
    if (s.stopped || index >= s.segments.length || s.cache.has(index)) return
    ttsService
      .fetchAudio(s.segments[index].text)
      .then((url) => {
        if (stateRef.current.stopped) URL.revokeObjectURL(url)
        else stateRef.current.cache.set(index, url)
      })
      .catch(() => {})
  }, [])

  const playIndex = useCallback(
    (index: number) => {
      const s = stateRef.current
      if (s.stopped) return

      if (index >= s.segments.length) {
        revokeAll()
        s.segments = []
        setStatus('idle')
        setActiveIndex(-1)
        return
      }

      const play = (url: string) => {
        if (stateRef.current.stopped) return
        setActiveIndex(index)
        setStatus('playing')
        stopAudio()
        const audio = new Audio(url)
        stateRef.current.audio = audio
        audio.onended = () => playIndexRef.current(index + 1)
        audio.play()
        prefetch(index + 1)
      }

      const cached = s.cache.get(index)
      if (cached) {
        play(cached)
      } else {
        ttsService
          .fetchAudio(s.segments[index].text)
          .then((url) => {
            if (stateRef.current.stopped) {
              URL.revokeObjectURL(url)
              return
            }
            stateRef.current.cache.set(index, url)
            play(url)
          })
          .catch(() => {
            if (!stateRef.current.stopped) playIndexRef.current(index + 1)
          })
      }
    },
    [stopAudio, revokeAll, prefetch]
  )

  // Keep the ref in sync so recursive onended / catch calls always use the latest version
  playIndexRef.current = playIndex

  const start = useCallback(async () => {
    if (!recipeId) return
    stateRef.current.stopped = false
    stateRef.current.segments = []
    revokeAll()
    setStatus('loading')
    setActiveIndex(-1)
    try {
      const brief = await recipesService.getCookingBrief(recipeId)
      if (stateRef.current.stopped) return
      stateRef.current.segments = brief.segments
      playIndexRef.current(0)
    } catch {
      setStatus('idle')
      dispatch(
        setNotification({ message: "Couldn't load the cooking brief. Please try again.", type: 'error' })
      )
    }
  }, [recipeId, dispatch, revokeAll])

  const pause = useCallback(() => {
    stateRef.current.audio?.pause()
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    stateRef.current.audio?.play()
    setStatus('playing')
  }, [])

  const stop = useCallback(() => {
    stateRef.current.stopped = true
    stopAudio()
    revokeAll()
    stateRef.current.segments = []
    setStatus('idle')
    setActiveIndex(-1)
  }, [stopAudio, revokeAll])

  useEffect(() => {
    // Capture ref value at mount time to satisfy exhaustive-deps lint rule;
    // the object is never replaced so mutations remain visible in cleanup.
    const state = stateRef.current
    return () => {
      state.stopped = true
      if (state.audio) {
        state.audio.pause()
        state.audio.onended = null
        state.audio = null
      }
      state.cache.forEach((url) => URL.revokeObjectURL(url))
      state.cache.clear()
    }
  }, [])

  const { segments } = stateRef.current
  const activeSegment =
    activeIndex >= 0 && activeIndex < segments.length ? segments[activeIndex] : null

  return { status, activeSegment, start, pause, resume, stop }
}
