/**
 * API Response Types
 * Standard response formats from the backend API
 */

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  timestamp?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  status: number
  message: string
  details?: Record<string, any>
  timestamp?: string
}
