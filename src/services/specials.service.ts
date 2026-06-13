import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  SpecialsPage,
  WeeklySpecial,
  IngredientSpecial,
  ListSpecialsParams,
  CreateSpecialsRequest,
  UpdateSpecialRequest,
} from '@/types/specials.types'

/**
 * Weekly Specials Service
 * /specials, /specials/ingredient/{id}, /admin/specials (Backend PRD §7.6)
 */
class SpecialsService {
  async listSpecials(params: ListSpecialsParams = {}): Promise<SpecialsPage> {
    const response = await apiClient.get<SpecialsPage>('/specials', { params })
    return response.data
  }

  async getSpecialsByIngredient(ingredientId: string): Promise<IngredientSpecial[]> {
    const response = await apiClient.get<IngredientSpecial[]>(`/specials/ingredient/${ingredientId}`)
    return response.data
  }

  async createSpecials(data: CreateSpecialsRequest): Promise<WeeklySpecial[]> {
    const response = await apiClient.post<WeeklySpecial[]>('/admin/specials', data)
    return response.data
  }

  async updateSpecial(id: string, data: UpdateSpecialRequest): Promise<WeeklySpecial> {
    const response = await apiClient.put<WeeklySpecial>(`/admin/specials/${id}`, data)
    return response.data
  }

  async deleteSpecial(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/admin/specials/${id}`)
    return response.data
  }
}

export default new SpecialsService()
