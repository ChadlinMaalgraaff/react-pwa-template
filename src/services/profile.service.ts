import apiClient from './api-client'
import { UserProfile, UpdateProfileRequest } from '@/types/profile.types'

/**
 * Profile Service
 * GET/PUT /profile (Backend PRD §7.1)
 */
class ProfileService {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/profile')
    return response.data
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/profile', data)
    return response.data
  }
}

export default new ProfileService()
