import apiClient from './api-client'
import { PartialEntityModel } from '@/types/common.types'
import {
  Retailer,
  CreateRetailerRequest,
  UpdateRetailerRequest,
  Store,
  ListStoresParams,
  CreateStoreRequest,
  UpdateStoreRequest,
} from '@/types/retailers.types'

/**
 * Retailers & Stores Service
 * /retailers, /stores, /admin/retailers, /admin/stores (Backend PRD §7.5)
 */
class RetailersService {
  async listRetailers(): Promise<Retailer[]> {
    const response = await apiClient.get<Retailer[]>('/retailers')
    return response.data
  }

  async createRetailer(data: CreateRetailerRequest): Promise<Retailer> {
    const response = await apiClient.post<Retailer>('/admin/retailers', data)
    return response.data
  }

  async updateRetailer(id: string, data: UpdateRetailerRequest): Promise<Retailer> {
    const response = await apiClient.put<Retailer>(`/admin/retailers/${id}`, data)
    return response.data
  }

  async listStores(params: ListStoresParams = {}): Promise<Store[]> {
    const response = await apiClient.get<Store[]>('/stores', { params })
    return response.data
  }

  async createStore(data: CreateStoreRequest): Promise<Store> {
    const response = await apiClient.post<Store>('/admin/stores', data)
    return response.data
  }

  async updateStore(id: string, data: UpdateStoreRequest): Promise<Store> {
    const response = await apiClient.put<Store>(`/admin/stores/${id}`, data)
    return response.data
  }

  async deleteStore(id: string): Promise<PartialEntityModel> {
    const response = await apiClient.delete<PartialEntityModel>(`/admin/stores/${id}`)
    return response.data
  }
}

export default new RetailersService()
