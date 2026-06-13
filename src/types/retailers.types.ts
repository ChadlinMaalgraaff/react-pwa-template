/**
 * Retailers & Stores Domain Types
 * Mirrors Retailer / Store (Backend PRD §6.7-6.8) and
 * /retailers, /stores, /admin/retailers, /admin/stores (§7.5)
 */

export interface Retailer {
  id: string
  name: string
  logoUrl: string | null
}

export interface CreateRetailerRequest {
  name: string
  logoUrl?: string
}

export type UpdateRetailerRequest = Partial<CreateRetailerRequest>

export interface Store {
  id: string
  retailerId: string
  retailerName: string
  branchName: string
  suburb: string | null
  city: string
}

export interface ListStoresParams {
  retailerId?: string
  suburb?: string
}

export interface CreateStoreRequest {
  retailerId: string
  branchName: string
  suburb?: string
  city?: string
}

export type UpdateStoreRequest = Partial<Omit<CreateStoreRequest, 'retailerId'>>
