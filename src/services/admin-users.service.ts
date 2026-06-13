import apiClient from './api-client'
import {
  AdminUsersPage,
  AdminUserSummary,
  ListAdminUsersParams,
  UpdateUserRoleRequest,
} from '@/types/admin-users.types'

/**
 * Admin User Management Service
 * /admin/users, /admin/users/{id}/role (Backend PRD §7.8)
 */
class AdminUsersService {
  async listUsers(params: ListAdminUsersParams = {}): Promise<AdminUsersPage> {
    const response = await apiClient.get<AdminUsersPage>('/admin/users', { params })
    return response.data
  }

  async updateUserRole(id: string, role: UpdateUserRoleRequest['role']): Promise<AdminUserSummary> {
    const response = await apiClient.put<AdminUserSummary>(`/admin/users/${id}/role`, { role })
    return response.data
  }
}

export default new AdminUsersService()
