import apiClient from './api-client'

class TtsService {
  async fetchAudio(text: string): Promise<string> {
    const response = await apiClient.post<Blob>('/tts', { text }, { responseType: 'blob' })
    return URL.createObjectURL(response.data)
  }
}

export default new TtsService()
