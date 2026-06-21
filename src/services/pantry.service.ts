import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  PantryItem,
  AddPantryItemsRequest,
  UpdatePantryItemRequest,
  PhotoUploadUrlRequest,
  PhotoUploadUrlResponse,
  PhotoAnalyzeResponse,
} from '@/types/pantry.types'

/**
 * Pantry Service
 * /pantry, /pantry/items, /pantry/photo-upload-url, /pantry/photo-analyze (Backend PRD §7.3)
 */
class PantryService {
  async listPantryItems(): Promise<PantryItem[]> {
    const response = await apiClient.get<PantryItem[]>('/pantry')
    return response.data
  }

  async addPantryItems(data: AddPantryItemsRequest): Promise<PantryItem[]> {
    const response = await apiClient.post<PantryItem[]>('/pantry/items', data)
    return response.data
  }

  async updatePantryItem(id: string, data: UpdatePantryItemRequest): Promise<PantryItem> {
    const response = await apiClient.put<PantryItem>(`/pantry/items/${id}`, data)
    return response.data
  }

  async deletePantryItem(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/pantry/items/${id}`)
    return response.data
  }

  async getPhotoUploadUrl(data: PhotoUploadUrlRequest): Promise<PhotoUploadUrlResponse> {
    const response = await apiClient.post<PhotoUploadUrlResponse>('/pantry/photo-upload-url', data)
    return response.data
  }

  async analyzePhoto(key: string): Promise<PhotoAnalyzeResponse> {
    const response = await apiClient.post<PhotoAnalyzeResponse>('/pantry/photo-analyze', { key })
    return response.data
  }

  async clearPantry(): Promise<void> {
    await apiClient.delete('/pantry')
  }
}

export default new PantryService()
