// ============================================
// DTOs pour les Champs Dynamiques de Sous-catégories
// ============================================

import type { FieldType } from '@prisma/client'

/**
 * DTO pour la création d'un champ dynamique
 */
export interface CreateFieldDTO {
    categoryId: string
    name: string
    label: string
    type: FieldType
    placeholder?: string
    required?: boolean
    order?: number
    options?: string[] // Pour les champs SELECT
    minValue?: number
    maxValue?: number
    minLength?: number
    maxLength?: number
}

/**
 * DTO pour la mise à jour d'un champ dynamique
 */
export interface UpdateFieldDTO {
    name?: string
    label?: string
    type?: FieldType
    placeholder?: string
    required?: boolean
    order?: number
    options?: string[]
    minValue?: number
    maxValue?: number
    minLength?: number
    maxLength?: number
}

/**
 * DTO pour la valeur d'un champ dynamique dans une annonce
 */
export interface FieldValueInput {
    fieldId: string
    value: string
}
