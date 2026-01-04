/**
 * Constantes centralisées pour la pagination
 * Utilisées dans toutes les routes API et composants frontend
 */

export const PAGINATION = {
    // Valeurs par défaut
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    DEFAULT_LIMIT_ADMIN: 20,
    DEFAULT_LIMIT_MESSAGES: 50,
    DEFAULT_LIMIT_CATEGORIES_HOME: 4,

    // Limites de sécurité
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
    MIN_PAGE: 1,

    // Options de limite pour les sélecteurs UI
    LIMIT_OPTIONS_PUBLIC: [12, 24, 48],
    LIMIT_OPTIONS_ADMIN: [10, 20, 50, 100],
} as const;

// Type pour les options de pagination
export type PaginationConfig = typeof PAGINATION;
