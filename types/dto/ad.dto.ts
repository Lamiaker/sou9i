// ============================================
// DTOs pour les Annonces
// ============================================

import type { FieldValueInput } from './subcategory-field.dto'

/**
 * DTO pour la création d'une annonce
 */
export interface CreateAdDTO {
    title: string
    description: string
    price: number
    categoryId: string
    userId: string
    images?: string[]
    location: string
    contactPhone?: string | null
    condition?: string
    brand?: string
    size?: string
    deliveryAvailable?: boolean
    negotiable?: boolean
    dynamicFields?: FieldValueInput[]
}

/**
 * DTO pour la mise à jour d'une annonce
 */
export interface UpdateAdDTO {
    title?: string
    description?: string
    price?: number
    status?: string
    location?: string
    condition?: string
    brand?: string
    size?: string
    images?: string[]
    deliveryAvailable?: boolean
    negotiable?: boolean
}

/**
 * DTO pour les filtres de recherche d'annonces
 */
export interface AdFiltersDTO {
    categoryId?: string
    subcategoryId?: string
    minPrice?: number
    maxPrice?: number
    location?: string
    condition?: string
    search?: string
    status?: string
    userId?: string
    moderationStatus?: string
    page?: number
    limit?: number
}
