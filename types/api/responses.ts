// ============================================
// Types de Réponses API spécifiques
// ============================================

import type { ApiResponse, PaginationMeta } from './common'

/**
 * Réponse pour la liste des annonces
 */
export interface AdsListResponse extends ApiResponse {
    data: {
        ads: unknown[]
        pagination: PaginationMeta
    }
}

/**
 * Réponse pour une annonce unique
 */
export interface AdDetailResponse extends ApiResponse {
    data: {
        ad: unknown
        relatedAds?: unknown[]
    }
}

/**
 * Réponse pour les statistiques du dashboard
 */
export interface DashboardStatsResponse extends ApiResponse {
    data: {
        totalAds: number
        activeAds: number
        totalViews: number
        unreadMessages: number
        pendingAds: number
        rejectedAds: number
        favoritesReceived: number
        myFavorites: number
    }
}

/**
 * Réponse pour l'authentification
 */
export interface AuthResponse extends ApiResponse {
    data: {
        user: {
            id: string
            name: string | null
            email: string
            avatar: string | null
            role: string
        }
    }
}

/**
 * Réponse pour les conversations
 */
export interface ConversationsResponse extends ApiResponse {
    data: {
        conversations: unknown[]
        unreadTotal: number
    }
}
