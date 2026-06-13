/**
 * Pantry Domain Types
 * Mirrors PantryItem (Backend PRD §6.4) and /pantry, /pantry/items,
 * /pantry/photo-upload-url, /pantry/photo-analyze (§7.3)
 */

export type PantryItemSource = 'manual' | 'photo'

export interface PantryItem {
  id: string
  ingredientId: string
  ingredientName: string
  category: string | null
  quantity: number
  unit: string
  source: PantryItemSource
  addedAt: string
}

export interface AddPantryItemInput {
  ingredientId?: string
  ingredientName?: string
  quantity: number
  unit: string
}

export interface AddPantryItemsRequest {
  items: AddPantryItemInput[]
}

export interface UpdatePantryItemRequest {
  quantity?: number
  unit?: string
}

export type PhotoContentType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic'

export interface PhotoUploadUrlRequest {
  contentType: PhotoContentType
}

export interface PhotoUploadUrlResponse {
  uploadUrl: string
  key: string
  expiresIn: number
}

export interface PhotoAnalyzeRequest {
  key: string
}

export interface PantrySuggestion {
  ingredientId: string | null
  name: string
  matchedExisting: boolean
  quantity: number
  unit: string
  confidence: number
}

export interface PhotoAnalyzeResponse {
  suggestions: PantrySuggestion[]
}
