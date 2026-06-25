import apiClient from './api-client'

class TtsService {
  private audioCache = new Map<string, string>()
  private audioPending = new Map<string, Promise<string>>()

  async fetchAudio(text: string): Promise<string> {
    const hit = this.audioCache.get(text)
    if (hit) return hit

    // Deduplicate concurrent callers for the same text
    const inflight = this.audioPending.get(text)
    if (inflight) return inflight

    const promise = apiClient
      .post<Blob>('/tts', { text }, { responseType: 'blob' })
      .then((response) => {
        const url = URL.createObjectURL(response.data)
        this.audioCache.set(text, url)
        this.audioPending.delete(text)
        return url
      })
      .catch((err: unknown) => {
        this.audioPending.delete(text)
        throw err
      })

    this.audioPending.set(text, promise)
    return promise
  }

  clearAudioCache() {
    this.audioCache.clear()
    this.audioPending.clear()
  }
}

export default new TtsService()
