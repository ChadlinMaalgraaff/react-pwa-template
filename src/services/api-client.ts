import axios, { AxiosInstance, AxiosError } from 'axios'

/**
 * API Client Service
 * Handles all HTTP requests to the backend API with automatic token management
 * and error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for token attachment
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Generic GET request
   */
  get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config)
  }

  /**
   * Generic POST request
   */
  post<T>(url: string, data: unknown, config = {}) {
    return this.client.post<T>(url, data, config)
  }

  /**
   * Generic PUT request
   */
  put<T>(url: string, data: unknown, config = {}) {
    return this.client.put<T>(url, data, config)
  }

  /**
   * Generic PATCH request
   */
  patch<T>(url: string, data: unknown, config = {}) {
    return this.client.patch<T>(url, data, config)
  }

  /**
   * Generic DELETE request
   */
  delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config)
  }
}

export default new ApiClient()
