import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import pantryService from '@/services/pantry.service'
import { usePantryCapture } from '../usePantryCapture'
import { PhotoAnalyzeResponse } from '@/types/pantry.types'

vi.mock('@/services/pantry.service', () => ({
  default: {
    getPhotoUploadUrl: vi.fn(),
    analyzePhoto: vi.fn(),
  },
}))

const mockedService = pantryService as unknown as Record<'getPhotoUploadUrl' | 'analyzePhoto', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

describe('usePantryCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('upload requests an upload url and PUTs the file', async () => {
    mockedService.getPhotoUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      key: 'photos/abc.jpg',
      expiresIn: 300,
    })
    const store = buildStore()
    const { result } = renderHook(() => usePantryCapture(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

    let key: string | undefined
    await act(async () => {
      key = await result.current.upload(file)
    })

    expect(mockedService.getPhotoUploadUrl).toHaveBeenCalledWith({ contentType: 'image/jpeg' })
    expect(global.fetch).toHaveBeenCalledWith('https://s3.example.com/upload', expect.objectContaining({ method: 'PUT' }))
    expect(key).toBe('photos/abc.jpg')
    expect(result.current.isUploading).toBe(false)
  })

  it('analyze calls analyzePhoto with the key', async () => {
    const response: PhotoAnalyzeResponse = { suggestions: [] }
    mockedService.analyzePhoto.mockResolvedValue(response)
    const store = buildStore()
    const { result } = renderHook(() => usePantryCapture(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    let analyzed: typeof response | undefined
    await act(async () => {
      analyzed = await result.current.analyze('photos/abc.jpg')
    })

    expect(mockedService.analyzePhoto).toHaveBeenCalledWith('photos/abc.jpg')
    expect(analyzed).toEqual(response)
    expect(result.current.isAnalyzing).toBe(false)
  })

  it('dispatches notification on upload error', async () => {
    mockedService.getPhotoUploadUrl.mockRejectedValue(new Error('Upload failed'))
    const store = buildStore()
    const { result } = renderHook(() => usePantryCapture(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await expect(result.current.upload(file)).rejects.toThrow('Upload failed')
    })

    expect(store.getState().ui.notification).toEqual({ message: 'Upload failed', type: 'error' })
  })
})
