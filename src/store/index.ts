import { configureStore } from '@reduxjs/toolkit'
import uiReducer from './slices/ui.slice'
import authReducer from './slices/auth.slice'
import pantryReducer from './slices/pantry.slice'

const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    pantry: pantryReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
