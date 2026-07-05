import apiClient from './api-client'
import { User } from '@store/slices/auth.slice'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  /**
   * Register new user. The backend auto-confirms new accounts and returns a
   * plain confirmation message — no tokens — so callers must follow up with
   * `login` to start a session.
   */
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/register', data)
    return response.data
  }

  /**
   * Exchange a Google (Cognito Hosted UI) authorization code for tokens.
   * The backend performs the code→token exchange and first-login provisioning,
   * returning the same token shape as password login.
   */
  async loginWithGoogleCode(code: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/google/callback', { code })
    return response.data
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response.data
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh', {})
    return response.data
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {})
    localStorage.removeItem('authToken')
  }
}

export default new AuthService()
