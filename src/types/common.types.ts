/**
 * Common Type Definitions
 * Shared types used across the application
 */

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

/**
 * Shape returned by paginated backend list endpoints
 * (GET /recipes, GET /specials, GET /admin/users, etc.)
 */
export interface PaginatedResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

/**
 * Acknowledgement shape returned by DELETE endpoints
 */
export interface PartialEntityModel {
  id: string
  message: string
}

export interface Filter {
  key: string
  value: unknown
  operator?: 'eq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
}

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}
