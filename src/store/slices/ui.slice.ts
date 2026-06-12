import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isLoading: boolean
  notification: {
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null
  theme: 'light' | 'dark'
  sidebarOpen: boolean
}

const initialState: UIState = {
  isLoading: false,
  notification: null,
  theme: 'light',
  sidebarOpen: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setNotification: (state, action: PayloadAction<UIState['notification']>) => {
      state.notification = action.payload
    },
    clearNotification: (state) => {
      state.notification = null
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
  },
})

export const {
  setIsLoading,
  setNotification,
  clearNotification,
  setTheme,
  setSidebarOpen,
} = uiSlice.actions

export default uiSlice.reducer
