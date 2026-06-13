/**
 * Profile Domain Types
 * Mirrors UserProfile (Backend PRD §6.2) and GET/PUT /profile (§7.1)
 */

export type UserRole = 'user' | 'admin'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  preferredArea: string | null
  dietaryPreferences: string[]
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  preferredArea?: string
  dietaryPreferences?: string[]
}
