// ============================================
// DTOs pour le Support
// ============================================

import type { TicketStatus, TicketCategory } from '@prisma/client'

/**
 * DTO pour la création d'un ticket de support
 */
export interface CreateTicketDTO {
    subject: string
    message: string
    category: TicketCategory
    userId?: string
    guestEmail?: string
    guestName?: string
}

/**
 * DTO pour la mise à jour d'un ticket
 */
export interface UpdateTicketDTO {
    status?: TicketStatus
    adminResponse?: string
    respondedById?: string
}

/**
 * DTO pour les filtres de tickets
 */
export interface TicketFiltersDTO {
    status?: TicketStatus
    category?: TicketCategory
    userId?: string
    page?: number
    limit?: number
}
