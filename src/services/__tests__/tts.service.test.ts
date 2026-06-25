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
})
