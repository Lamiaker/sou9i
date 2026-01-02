// ============================================
// DTOs pour les Demandes de Services
// ============================================

import type { ServiceRequestStatus, ServiceType } from '@prisma/client'

/**
 * DTO pour la création d'une demande de service
 */
export interface CreateServiceRequestDTO {
    name: string
    email: string
    phone?: string
    company?: string
    serviceType: ServiceType
    budget?: string
    deadline?: string
    description: string
}

/**
 * DTO pour la mise à jour d'une demande de service
 */
export interface UpdateServiceRequestDTO {
    status?: ServiceRequestStatus
    adminNotes?: string
}

/**
 * DTO pour les filtres de demandes de services
 */
export interface ServiceRequestFiltersDTO {
    status?: ServiceRequestStatus
    serviceType?: ServiceType
    page?: number
    limit?: number
}
