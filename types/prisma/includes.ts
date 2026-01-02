// ============================================
// Types Prisma avec includes/relations
// Dérivés du schéma Prisma pour les requêtes avec relations
// ============================================

import { Prisma } from '@prisma/client'

/**
 * Type pour User avec toutes ses relations
 */
export type UserWithRelations = Prisma.UserGetPayload<{
    include: {
        ads: true
        favorites: true
    }
}>

/**
 * Type pour Ad avec ses relations principales
 */
export type AdWithRelations = Prisma.AdGetPayload<{
    include: {
        user: {
            select: {
                id: true
                name: true
                avatar: true
                city: true
                isVerified: true
            }
        }
        category: true
        favorites: true
    }
}>

/**
 * Type pour Conversation avec messages et participants
 */
export type ConversationWithMessages = Prisma.ConversationGetPayload<{
    include: {
        participants: {
            select: {
                id: true
                name: true
                avatar: true
            }
        }
        messages: {
            include: {
                sender: {
                    select: {
                        id: true
                        name: true
                        avatar: true
                    }
                }
            }
            orderBy: {
                createdAt: 'desc'
            }
        }
    }
}>

/**
 * Type pour les inputs de création d'annonce
 */
export type CreateAdInput = Omit<Prisma.AdCreateInput, 'user' | 'category'> & {
    userId: string
    categoryId: string
}

/**
 * Type pour les inputs de création d'utilisateur
 */
export type CreateUserInput = Prisma.UserCreateInput

/**
 * Type pour les inputs de mise à jour d'annonce
 */
export type UpdateAdInput = Partial<Omit<Prisma.AdUpdateInput, 'user' | 'category'>>

/**
 * Type pour les filtres de recherche d'annonces (backend)
 */
export type AdFilters = {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    location?: string
    condition?: string
    search?: string
    userId?: string
    status?: string
}
