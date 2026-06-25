import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import recipesService from '@/services/recipes.service'
import ttsService from '@/services/tts.service'
import { useCookingBrief } from '../useCookingBrief'

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
    { type: 'intro' as const, index: 0, text: 'Welcome to Bobotie' },
    { type: 'step' as const, index: 1, stepIndex: 0, text: 'Brown the mince' },
    { type: 'step' as const, index: 2, stepIndex: 1, text: 'Bake until set' },
  ],
}

const buildStore = () =>
  configureStore({ reducer: { ui: uiReducer, auth: authReducer } })

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={buildStore()}>{children}</Provider>
)

describe('useCookingBrief', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAudioInstances.length = 0
    mockedFetchAudio.mockResolvedValue('blob:mock')
  })

  it('starts with idle status and no active segment', () => {
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })
    expect(result.current.status).toBe('idle')
    expect(result.current.activeSegment).toBeNull()
  })

  it('transitions to loading immediately when start() is called', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })

    expect(result.current.status).toBe('loading')
  })

  it('transitions to playing and sets activeSegment to intro after brief loads', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })

    await waitFor(() => {
      expect(result.current.status).toBe('playing')
      expect(result.current.activeSegment?.type).toBe('intro')
    })
    expect(mockAudioInstances[0].play).toHaveBeenCalled()
  })

  it('transitions to paused when pause() is called', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.pause() })

    expect(result.current.status).toBe('paused')
    expect(mockAudioInstances[0].pause).toHaveBeenCalled()
  })

  it('transitions back to playing when resume() is called', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.pause() })
    act(() => { result.current.resume() })

    expect(result.current.status).toBe('playing')
    expect(mockAudioInstances[0].play).toHaveBeenCalledTimes(2)
  })

  it('resets to idle and clears activeSegment when stop() is called', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })
    await waitFor(() => expect(result.current.status).toBe('playing'))

    act(() => { result.current.stop() })

    expect(result.current.status).toBe('idle')
    expect(result.current.activeSegment).toBeNull()
  })

  it('advances to the next segment when audio ends', async () => {
    mockedGetCookingBrief.mockResolvedValue(BRIEF)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })
    await waitFor(() => expect(result.current.activeSegment?.type).toBe('intro'))

    await act(async () => {
      mockAudioInstances[0].onended?.()
    })

    await waitFor(() => {
      expect(result.current.activeSegment?.type).toBe('step')
      expect(result.current.activeSegment?.stepIndex).toBe(0)
    })
  })

  it('returns to idle after the last segment finishes', async () => {
    const singleSegmentBrief = { segments: [BRIEF.segments[0]] }
    mockedGetCookingBrief.mockResolvedValue(singleSegmentBrief)
    const { result } = renderHook(() => useCookingBrief('recipe-1'), { wrapper })

    act(() => { result.current.start() })
    await waitFor(() => expect(result.current.status).toBe('playing'))

    await act(async () => {
      mockAudioInstances[0].onended?.()
    })

    await waitFor(() => expect(result.current.status).toBe('idle'))
    expect(result.current.activeSegment).toBeNull()
  })

  it('dispatches an error notification when getCookingBrief fails', async () => {
    mockedGetCookingBrief.mockRejectedValue(new Error('Network error'))
    const store = buildStore()

    const { result } = renderHook(() => useCookingBrief('recipe-1'), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    act(() => { result.current.start() })

    await waitFor(() => expect(result.current.status).toBe('idle'))

    const state = store.getState() as { ui: { notification: { message: string } | null } }
    expect(state.ui.notification?.message).toContain("Couldn't load")
  })

  it('does nothing when start() is called without a recipeId', async () => {
    const { result } = renderHook(() => useCookingBrief(undefined), { wrapper })

    await act(async () => { await result.current.start() })

    expect(result.current.status).toBe('idle')
    expect(mockedGetCookingBrief).not.toHaveBeenCalled()
  })
})
