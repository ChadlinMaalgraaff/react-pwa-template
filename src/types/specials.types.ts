/**
 * Weekly Specials Domain Types
 * Mirrors WeeklySpecial (Backend PRD §6.9) and
 * /specials, /specials/ingredient/{id}, /admin/specials (§7.6)
 */

import { PaginatedResult } from './common.types'

export interface WeeklySpecial {
  id: string
  retailerId: string
  retailerName: string
  storeId: string | null
  ingredientId: string | null
  ingredientName: string | null
  itemName: string
  price: number
  unit: string | null
  imageUrl: string | null
  validFrom: string
  validTo: string
}

export interface ListSpecialsParams {
  retailerId?: string
  search?: string
  active?: boolean
  page?: number
  pageSize?: number
}

export type SpecialsPage = PaginatedResult<WeeklySpecial>

export interface IngredientSpecial {
  id: string
  retailerId: string
  retailerName: string
  itemName: string
  price: number
  unit: string | null
  validTo: string
}

export interface CreateSpecialItemInput {
  itemName: string
  price: number
  unit?: string
  storeId?: string
  ingredientId?: string
  imageUrl?: string
}

export interface CreateSpecialsRequest {
  retailerId: string
  validFrom: string
  validTo: string
  items: CreateSpecialItemInput[]
}

export interface UpdateSpecialRequest {
  ingredientId?: string
  storeId?: string
  itemName?: string
  price?: number
  unit?: string
  imageUrl?: string
  validFrom?: string
  validTo?: string
}
