/**
 * Admin User Management Domain Types
 * Mirrors /admin/users, /admin/users/{id}/role (Backend PRD §7.8)
 */

import { PaginatedResult } from './common.types'
import { UserRole } from './profile.types'

export interface AdminUserSummary {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface ListAdminUsersParams {
  search?: string
  page?: number
  pageSize?: number
}

export type AdminUsersPage = PaginatedResult<AdminUserSummary>

export interface UpdateUserRoleRequest {
  role: UserRole
}
