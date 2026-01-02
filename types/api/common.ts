// ============================================
// Types API Communs
// Types pour les réponses et requêtes API standardisées
// ============================================

/**
 * Réponse API standardisée pour toutes les routes.
 * Chaque réponse API doit suivre ce format.
 * 
 * @template T - Type des données retournées
 * 
 * @example Réponse de succès
 * ```json
 * {
 *   "success": true,
 *   "data": { "id": "123", "name": "Test" }
 * }
 * ```
 * 
 * @example Réponse d'erreur
 * ```json
 * {
 *   "success": false,
 *   "error": "Annonce non trouvée",
 *   "code": "NOT_FOUND"
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
    /** Indique si la requête a réussi */
    success: boolean
    /** Données retournées (présent si success = true) */
    data?: T
    /** Message d'erreur user-friendly (présent si success = false) */
    error?: string
    /** Code d'erreur technique pour le debug (ex: "NOT_FOUND", "VALIDATION_ERROR") */
    code?: string
    /** Message additionnel (succès ou info) */
    message?: string
}

/**
 * Réponse API paginée pour les listes.
 * Étend ApiResponse avec les métadonnées de pagination.
 * 
 * @template T - Type des éléments dans la liste
 * 
 * @example
 * ```json
 * {
 *   "success": true,
 *   "data": [{ "id": "1" }, { "id": "2" }],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 12,
 *     "total": 156,
 *     "totalPages": 13
 *   }
 * }
 * ```
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    /** Métadonnées de pagination */
    pagination: {
        /** Page courante (1-indexed) */
        page: number
        /** Nombre d'éléments par page */
        limit: number
        /** Nombre total d'éléments */
        total: number
        /** Nombre total de pages */
        totalPages: number
    }
}

/**
 * Paramètres de pagination pour les requêtes.
 * Utilisé dans les query strings.
 * 
 * @example
 * ```ts
 * const params: PaginationParams = { page: 2, limit: 20 }
 * // URL: /api/ads?page=2&limit=20
 * ```
 */
export interface PaginationParams {
    /** Numéro de page (défaut: 1) */
    page?: number
    /** Nombre d'éléments par page (défaut: 12, max: 100) */
    limit?: number
}

/**
 * Métadonnées de pagination étendues.
 * Inclut des helpers pour la navigation.
 * 
 * @example
 * ```tsx
 * {pagination.hasNextPage && <button onClick={nextPage}>Suivant</button>}
 * ```
 */
export interface PaginationMeta {
    /** Page courante */
    page: number
    /** Éléments par page */
    limit: number
    /** Total des éléments */
    total: number
    /** Total des pages */
    totalPages: number
    /** Indique s'il y a une page suivante */
    hasNextPage: boolean
    /** Indique s'il y a une page précédente */
    hasPreviousPage: boolean
}

/**
 * Type pour les handlers de routes API Next.js.
 * Utilisé pour typer les fonctions GET, POST, PUT, DELETE.
 * 
 * @template T - Type des données de la réponse
 * 
 * @example
 * ```ts
 * export const GET: ApiHandler<Ad[]> = async (request) => {
 *   const ads = await AdService.getAds()
 *   return successResponse(ads)
 * }
 * ```
 */
export type ApiHandler<T = unknown> = (
    request: Request,
    context?: { params?: Promise<Record<string, string>> }
) => Promise<Response>

/**
 * Options pour le wrapper d'authentification `withAuth`.
 * 
 * @example
 * ```ts
 * // Route admin uniquement
 * export const DELETE = withAuth(handler, { requireAdmin: true })
 * ```
 */
export interface AuthOptions {
    /** Si true, vérifie que l'utilisateur a le rôle ADMIN */
    requireAdmin?: boolean
}

