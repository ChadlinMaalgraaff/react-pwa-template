import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import recipesService from '@/services/recipes.service'
import ttsService from '@/services/tts.service'
import { useCookingMode } from '../useCookingMode'

vi.mock('@/services/recipes.service', () => ({
  default: { getCookingBrief: vi.fn() },
}))

vi.mock('@/services/tts.service', () => ({
  default: { fetchAudio: vi.fn() },
}))

const mockedGetCookingBrief = recipesService.getCookingBrief as ReturnType<typeof vi.fn>
const mockedFetchAudio = ttsService.fetchAudio as ReturnType<typeof vi.fn>

type MockAudioInstance = {
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  onended: (() => void) | null
}

const mockAudioInstances: MockAudioInstance[] = []

vi.stubGlobal(
  'Audio',
  vi.fn().mockImplementation(() => {
    const instance: MockAudioInstance = { play: vi.fn(), pause: vi.fn(), onended: null }
    mockAudioInstances.push(instance)
    return instance
  })
)

global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock')
global.URL.revokeObjectURL = vi.fn()

const BRIEF = {
  segments: [
    { type: 'intro' as const, index: 0, text: 'Welcome intro' },
    { type: 'step' as const, index: 1, stepIndex: 0, text: 'Brown the mince' },
    { type: 'step' as const, index: 2, stepIndex: 1, text: 'Add spices' },
    { type: 'step' as const, index: 3, stepIndex: 2, text: 'Bake until set' },
  ],
}

// step segments only (intro filtered out)
const STEPS = BRIEF.segments.filter((s) => s.type === 'step')

const buildStore = () =>
  configureStore({ reducer: { ui: uiReducer, auth: authReducer } })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={buildStore()}>{children}</Provider>
)

/** Skip the countdown so tests that don't care about it reach 'playing' quickly. */
const startAndSkip = (result: { current: ReturnType<typeof useCookingMode> }) => {
  act(() => { result.current.start() })
  act(() => { result.current.skipCountdown() })
}

describe('useCookingMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAudioInstances.length = 0
    mockedFetchAudio.mockResolvedValue('blob:mock')
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
  })

  it('starts with idle status and no active step', () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })
    expect(result.current.status).toBe('idle')
    expect(result.current.currentStep).toBeNull()
    expect(result.current.totalSteps).toBe(0)
  })

  it('transitions to countdown immediately when start() is called', () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })
    act(() => { result.current.start() })
    expect(result.current.status).toBe('countdown')
  })

  it('does nothing when start() is called without a recipeId', async () => {
    const { result } = renderHook(() => useCookingMode(undefined), { wrapper })

    await act(async () => { await result.current.start() })

    expect(result.current.status).toBe('idle')
    expect(mockedGetCookingBrief).not.toHaveBeenCalled()
  })

  it('filters out intro segments and starts playing step 0', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)

    await waitFor(() => {
      expect(result.current.status).toBe('playing')
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.currentStep?.text).toBe(STEPS[0].text)
    })
    expect(mockAudioInstances[0].play).toHaveBeenCalled()
  })

  it('exposes the correct totalSteps count (intro excluded)', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    expect(result.current.totalSteps).toBe(STEPS.length)
  })

  it('prefetches all steps in the background once step 0 starts playing', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    expect(mockedFetchAudio).toHaveBeenCalledWith(STEPS[0].text)
    expect(mockedFetchAudio).toHaveBeenCalledWith(STEPS[1].text)
    expect(mockedFetchAudio).toHaveBeenCalledWith(STEPS[2].text)
  })

  it('advances to the next step when next() is called', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.next() })

    await waitFor(() => {
      expect(result.current.currentStepIndex).toBe(1)
      expect(result.current.currentStep?.text).toBe(STEPS[1].text)
    })
  })

  it('goes to done when next() is called on the last step', async () => {
    const singleStep = {
      segments: [{ type: 'step' as const, index: 0, stepIndex: 0, text: 'Only step' }],
    }
    mockedGetCookingBrief.mockResolvedValue(singleStep)
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.next() })

    await waitFor(() => expect(result.current.status).toBe('done'))
  })

  it('goes back to the previous step when prev() is called', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.next() })
    await waitFor(() => expect(result.current.currentStepIndex).toBe(1))

    act(() => { result.current.prev() })
    await waitFor(() => {
      expect(result.current.currentStepIndex).toBe(0)
      expect(result.current.currentStep?.text).toBe(STEPS[0].text)
    })
  })

  it('does not go below step 0 when prev() is called on the first step', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.prev() })
    await waitFor(() => expect(result.current.currentStepIndex).toBe(0))
  })

  it('replays the current step audio when replay() is called', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    const audioCountBefore = mockAudioInstances.length
    act(() => { result.current.replay() })

    await waitFor(() => expect(mockAudioInstances.length).toBeGreaterThan(audioCountBefore))
    expect(result.current.currentStepIndex).toBe(0)
  })

  it('pauses audio and sets status to paused', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.pause() })

    expect(result.current.status).toBe('paused')
    expect(mockAudioInstances[0].pause).toHaveBeenCalled()
  })

  it('resumes audio and sets status to playing', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.pause() })
    act(() => { result.current.resume() })

    expect(result.current.status).toBe('playing')
    expect(mockAudioInstances[0].play).toHaveBeenCalledTimes(2)
  })

  it('sets status to paused when audio ends naturally', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    await act(async () => { mockAudioInstances[0].onended?.() })

    expect(result.current.status).toBe('paused')
  })

  it('exits to idle and clears all state', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.exit() })

    expect(result.current.status).toBe('idle')
    expect(result.current.currentStep).toBeNull()
    expect(result.current.totalSteps).toBe(0)
    expect(mockAudioInstances[0].pause).toHaveBeenCalled()
  })

  it('dispatches an error notification when getCookingBrief fails', async () => {
    mockedGetCookingBrief.mockRejectedValue(new Error('Network error'))
    const store = buildStore()

    const { result } = renderHook(() => useCookingMode('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    act(() => { result.current.start() })
    act(() => { result.current.skipCountdown() })

    await waitFor(() => expect(result.current.status).toBe('idle'))

    const state = store.getState() as { ui: { notification: { message: string } | null } }
    expect(state.ui.notification?.message).toContain("Couldn't start cooking mode")
  })

  it('goes to done state when brief has no step segments', async () => {
    const introOnly = {
      segments: [{ type: 'intro' as const, index: 0, text: 'Intro only' }],
    }
    mockedGetCookingBrief.mockResolvedValue(introOnly)
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)

    await waitFor(() => expect(result.current.status).toBe('done'))
  })

  it('calls getCookingBrief in the background on mount to warm the cache', async () => {
    renderHook(() => useCookingMode('recipe-1'), { wrapper })

    await waitFor(() => expect(mockedGetCookingBrief).toHaveBeenCalledWith('recipe-1'))
  })

  it('does not background-prefetch when recipeId is undefined', () => {
    renderHook(() => useCookingMode(undefined), { wrapper })
    expect(mockedGetCookingBrief).not.toHaveBeenCalled()
  })

  it('uses cached audio on replay without re-fetching', async () => {
    const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

    startAndSkip(result)
    await waitFor(() => expect(result.current.status).toBe('playing'))

    const fetchCountAfterStart = mockedFetchAudio.mock.calls.length

    act(() => { result.current.replay() })
    await waitFor(() => expect(result.current.status).toBe('playing'))

    // fetchAudio should not have been called again for step 0
    expect(mockedFetchAudio.mock.calls.length).toBe(fetchCountAfterStart)
  })

  describe('countdown', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('transitions to playing after the 3-second timer fires', async () => {
      const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

      // Await start() so the fetch chain (getCookingBrief + fetchAudio) completes
      // before we advance the fake timer.
      await act(async () => { await result.current.start() })
      expect(result.current.status).toBe('countdown')

      // Fire the countdown timer
      await act(async () => { vi.advanceTimersByTime(3000) })

      expect(result.current.status).toBe('playing')
    })

    it('skipCountdown goes to playing immediately when audio is already ready', async () => {
      const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

      await act(async () => { await result.current.start() })
      // readyToPlay = true at this point; timer still pending

      act(() => { result.current.skipCountdown() })

      expect(result.current.status).toBe('playing')
    })

    it('skipCountdown transitions to loading when audio is not yet ready', async () => {
      mockedFetchAudio.mockReturnValue(new Promise(() => {})) // never resolves
      const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

      act(() => { result.current.start() })
      act(() => { result.current.skipCountdown() })

      expect(result.current.status).toBe('loading')
    })

    it('exit during countdown cancels the timer and returns to idle', () => {
      const { result } = renderHook(() => useCookingMode('recipe-1'), { wrapper })

      act(() => { result.current.start() })
      expect(result.current.status).toBe('countdown')

      act(() => { result.current.exit() })
      expect(result.current.status).toBe('idle')

      // Timer should be cancelled — advancing should not trigger a play
      act(() => { vi.advanceTimersByTime(3000) })
      expect(result.current.status).toBe('idle')
    })
  })
})
