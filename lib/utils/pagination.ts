/**
 * Utilitaires de pagination sécurisés
 * Valide et sanitize les paramètres de pagination pour éviter les injections
 */

import { PAGINATION } from '@/lib/constants/pagination';

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface SanitizeOptions {
    defaultLimit?: number;
    maxLimit?: number;
}

/**
 * Sanitize et valide les paramètres de pagination
 * Protège contre les valeurs négatives, NaN, et les limites excessives
 * 
 * @param rawPage - Valeur brute de la page (string, number, ou undefined)
 * @param rawLimit - Valeur brute de la limite (string, number, ou undefined)
 * @param options - Options de configuration (limites par défaut et max)
 * @returns Paramètres de pagination validés et sécurisés
 * 
 * @example
 * // Usage basique
 * const { page, limit } = sanitizePaginationParams(
 *     searchParams.get('page'),
 *     searchParams.get('limit')
 * );
 * 
 * @example
 * // Usage avec options personnalisées (admin)
 * const { page, limit } = sanitizePaginationParams(
 *     searchParams.get('page'),
 *     searchParams.get('limit'),
 *     { defaultLimit: 20, maxLimit: 100 }
 * );
 */
export function sanitizePaginationParams(
    rawPage?: string | number | null,
    rawLimit?: string | number | null,
    options: SanitizeOptions = {}
): PaginationParams {
    const {
        defaultLimit = PAGINATION.DEFAULT_LIMIT,
        maxLimit = PAGINATION.MAX_LIMIT,
    } = options;

    // Parse page avec protection contre NaN et valeurs négatives
    let page: number = PAGINATION.DEFAULT_PAGE;
    if (rawPage !== null && rawPage !== undefined) {
        const parsed = typeof rawPage === 'number' ? rawPage : parseInt(String(rawPage), 10);
        if (!isNaN(parsed) && isFinite(parsed) && parsed >= PAGINATION.MIN_PAGE) {
            page = Math.floor(parsed); // Assure un entier
        }
    }

    // Parse limit avec protection contre NaN, valeurs négatives et excessives
    let limit = defaultLimit;
    if (rawLimit !== null && rawLimit !== undefined) {
        const parsed = typeof rawLimit === 'number' ? rawLimit : parseInt(String(rawLimit), 10);
        if (!isNaN(parsed) && isFinite(parsed)) {
            // Clamp entre MIN_LIMIT et maxLimit
            limit = Math.min(maxLimit, Math.max(PAGINATION.MIN_LIMIT, Math.floor(parsed)));
        }
    }

    return { page, limit };
}

/**
 * Calcule le skip pour Prisma à partir des paramètres de pagination
 * 
 * @param page - Numéro de page (1-indexed)
 * @param limit - Nombre d'éléments par page
 * @returns Nombre d'éléments à skip
 */
export function calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
}

/**
 * Calcule le nombre total de pages
 * 
 * @param total - Nombre total d'éléments
 * @param limit - Nombre d'éléments par page
 * @returns Nombre total de pages (minimum 1)
 */
export function calculateTotalPages(total: number, limit: number): number {
    return Math.max(1, Math.ceil(total / limit));
}

/**
 * Construit l'objet de pagination standard pour les réponses API
 * 
 * @param page - Page courante
 * @param limit - Éléments par page
 * @param total - Total des éléments
 * @returns Objet de pagination formaté
 */
export function buildPaginationResponse(page: number, limit: number, total: number) {
    return {
        page,
        limit,
        total,
        totalPages: calculateTotalPages(total, limit),
    };
}

/**
 * Vérifie si une page demandée est valide par rapport au total
 * Utile pour rediriger vers la dernière page valide
 * 
 * @param page - Page demandée
 * @param totalPages - Nombre total de pages
 * @returns true si la page est valide
 */
export function isValidPage(page: number, totalPages: number): boolean {
    return page >= 1 && page <= totalPages;
}

/**
 * Retourne la page valide la plus proche
 * Si page > totalPages, retourne totalPages
 * Si page < 1, retourne 1
 * 
 * @param page - Page demandée
 * @param totalPages - Nombre total de pages
 * @returns Page valide la plus proche
 */
export function getClosestValidPage(page: number, totalPages: number): number {
    if (totalPages === 0) return 1;
    return Math.max(1, Math.min(page, totalPages));
}
