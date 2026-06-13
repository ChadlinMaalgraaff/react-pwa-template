import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import uiReducer from '@store/slices/ui.slice'
import authReducer from '@store/slices/auth.slice'
import pantryReducer from '@store/slices/pantry.slice'
import specialsService from '@/services/specials.service'
import { useSpecialsUpload } from '../useSpecialsUpload'

vi.mock('@/services/specials.service', () => ({
  default: {
    createSpecials: vi.fn(),
  },
}))

const mockedService = specialsService as unknown as Record<'createSpecials', ReturnType<typeof vi.fn>>

const buildStore = () =>
  configureStore({
    reducer: { ui: uiReducer, auth: authReducer, pantry: pantryReducer },
  })

describe('useSpecialsUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploadSpecials calls the service and notifies success', async () => {
    mockedService.createSpecials.mockResolvedValue([])
    const store = buildStore()
    const { result } = renderHook(() => useSpecialsUpload(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await result.current.uploadSpecials({ retailerId: 'ret-1', validFrom: '2026-06-09', validTo: '2026-06-15', items: [] })
    })

    expect(mockedService.createSpecials).toHaveBeenCalled()
    expect(store.getState().ui.notification).toEqual({ message: 'Specials uploaded.', type: 'success' })
    expect(result.current.isSaving).toBe(false)
  })

  it('dispatches notification on error', async () => {
    mockedService.createSpecials.mockRejectedValue(new Error('Upload failed'))
    const store = buildStore()
    const { result } = renderHook(() => useSpecialsUpload(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })

    await act(async () => {
      await expect(
        result.current.uploadSpecials({ retailerId: 'ret-1', validFrom: '2026-06-09', validTo: '2026-06-15', items: [] })
      ).rejects.toThrow('Upload failed')
    })

    expect(result.current.error).toBe('Upload failed')
    expect(store.getState().ui.notification).toEqual({ message: 'Upload failed', type: 'error' })
  })
})
