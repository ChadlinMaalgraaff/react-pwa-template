import { RootState } from '@store/index'

export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthError = (state: RootState) => state.auth.error
export const selectIsAdmin = (state: RootState) => state.auth.user?.role === 'admin'
