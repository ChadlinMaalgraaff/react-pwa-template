import { describe, it, expect, vi, beforeEach } from 'vitest'
import apiClient from '../api-client'
import ttsService from '../tts.service'

vi.mock('../api-client', () => ({
  default: {
    post: vi.fn(),
  },
}))

const mockedClient = apiClient as unknown as Record<'post', ReturnType<typeof vi.fn>>

const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-audio-url')
const mockRevokeObjectURL = vi.fn()
vi.stubGlobal('URL', { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL })

describe('ttsService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-audio-url')
    ttsService.clearAudioCache()
  })

  it('posts text and returns a blob URL', async () => {
    const blob = new Blob(['audio-data'], { type: 'audio/mpeg' })
    mockedClient.post.mockResolvedValue({ data: blob })

    const result = await ttsService.fetchAudio('Brown the mince in a hot pan')

    expect(mockedClient.post).toHaveBeenCalledWith(
      '/tts',
      { text: 'Brown the mince in a hot pan' },
      { responseType: 'blob' }
    )
    expect(mockCreateObjectURL).toHaveBeenCalledWith(blob)
    expect(result).toBe('blob:mock-audio-url')
  })

  it('propagates errors from the API', async () => {
    mockedClient.post.mockRejectedValue(new Error('TTS unavailable'))

    await expect(ttsService.fetchAudio('Some text')).rejects.toThrow('TTS unavailable')
  })

  it('returns the cached blob URL on second call without hitting the API', async () => {
    const blob = new Blob(['audio'], { type: 'audio/mpeg' })
    mockedClient.post.mockResolvedValue({ data: blob })

    const first = await ttsService.fetchAudio('Brown the mince')
    const second = await ttsService.fetchAudio('Brown the mince')

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    expect(second).toBe(first)
  })

  it('deduplicates concurrent calls for the same text', async () => {
    const blob = new Blob(['audio'], { type: 'audio/mpeg' })
    mockedClient.post.mockResolvedValue({ data: blob })

    const [a, b] = await Promise.all([
      ttsService.fetchAudio('Brown the mince'),
      ttsService.fetchAudio('Brown the mince'),
    ])

    expect(mockedClient.post).toHaveBeenCalledTimes(1)
    expect(a).toBe(b)
  })
})
