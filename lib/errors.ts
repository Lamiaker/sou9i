/**
 * Système de gestion des erreurs centralisé
 * Permet de distinguer les erreurs attendues (métier) des erreurs inattendues (techniques)
 */

// Messages d'erreur standards user-friendly
export const ERROR_MESSAGES = {
    // Erreurs génériques
    GENERIC: "Une erreur est survenue. Veuillez réessayer.",
    NETWORK: "Impossible de contacter le serveur. Vérifiez votre connexion.",
    TIMEOUT: "La requête a pris trop de temps. Veuillez réessayer.",
    SERVICE_UNAVAILABLE: "Service temporairement indisponible.",

    // Authentification
    INVALID_CREDENTIALS: "Email ou mot de passe incorrect",
    SESSION_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
    UNAUTHORIZED: "Vous devez être connecté pour effectuer cette action.",
    FORBIDDEN: "Vous n'avez pas les permissions nécessaires.",

    // Ressources
    NOT_FOUND: "La ressource demandée n'existe pas.",
    AD_NOT_FOUND: "Cette annonce n'existe pas ou a été supprimée.",
    USER_NOT_FOUND: "Utilisateur non trouvé.",
    CATEGORY_NOT_FOUND: "Catégorie non trouvée.",

    // Validation
    VALIDATION_ERROR: "Veuillez vérifier les informations saisies.",
    REQUIRED_FIELD: "Ce champ est requis.",
    INVALID_FORMAT: "Format invalide.",

    // Actions
    SAVE_ERROR: "Impossible d'enregistrer. Veuillez réessayer.",
    DELETE_ERROR: "Impossible de supprimer. Veuillez réessayer.",
    UPLOAD_ERROR: "Échec du téléchargement. Veuillez réessayer.",
    UPDATE_ERROR: "Impossible de mettre à jour. Veuillez réessayer.",

    // Rate limiting
    TOO_MANY_REQUESTS: "Trop de tentatives. Veuillez réessayer plus tard.",
} as const;

/**
 * Erreur applicative attendue (validation, auth, not found, etc.)
 * Ces erreurs ont des messages user-friendly qui peuvent être affichés
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly code?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code?: string
    ) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Erreur attendue/contrôlée
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

/**
 * Erreur de validation (400)
 */
export class ValidationError extends AppError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, 400, 'VALIDATION_ERROR');
        this.field = field;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

/**
 * Erreur d'authentification (401)
 */
export class AuthenticationError extends AppError {
    constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
        super(message, 401, 'AUTHENTICATION_ERROR');
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

/**
 * Erreur d'autorisation (403)
 */
export class ForbiddenError extends AppError {
    constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
        super(message, 403, 'FORBIDDEN_ERROR');
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

/**
 * Erreur ressource non trouvée (404)
 */
export class NotFoundError extends AppError {
    constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
        super(message, 404, 'NOT_FOUND_ERROR');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

/**
 * Erreur de conflit (409)
 */
export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT_ERROR');
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

/**
 * Erreur rate limiting (429)
 */
export class RateLimitError extends AppError {
    constructor(message: string = ERROR_MESSAGES.TOO_MANY_REQUESTS) {
        super(message, 429, 'RATE_LIMIT_ERROR');
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

/**
 * Type guard pour vérifier si une erreur est une AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Convertit une erreur quelconque en message user-friendly
 * Ne révèle jamais de détails techniques
 */
export function getErrorMessage(error: unknown): string {
    // Si c'est une AppError, on peut afficher son message
    if (isAppError(error)) {
        return error.message;
    }

    // Si c'est une Error standard, vérifier les messages connus
    if (error instanceof Error) {
        // Messages métier qui peuvent être affichés
        const safeMessages = [
            "Cet email est déjà utilisé",
            "Annonce non trouvée",
            "Catégorie non trouvée",
            "Non autorisé",
            "Accès refusé",
            "Favori non trouvé",
            "Conversation non trouvée ou accès refusé",
            "Déjà en favoris",
        ];

        if (safeMessages.some(msg => error.message.includes(msg))) {
            return error.message;
        }
    }

    // Pour toute autre erreur, retourner un message générique
    return ERROR_MESSAGES.GENERIC;
}

/**
 * Log une erreur côté serveur avec contexte
 * Ne jamais exposer ce log au client
 */
export function logServerError(
    error: unknown,
    context?: {
        route?: string;
        userId?: string;
        action?: string;
        metadata?: Record<string, unknown>;
    }
): void {
    const timestamp = new Date().toISOString();
    const errorDetails = {
        timestamp,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        isOperational: isAppError(error) ? error.isOperational : false,
        code: isAppError(error) ? error.code : undefined,
        ...context,
    };

    // En production, on pourrait envoyer à un service de logging
    // Pour l'instant, on log dans la console serveur
    console.error('[SERVER ERROR]', JSON.stringify(errorDetails, null, 2));
}

/**
 * Crée une réponse d'erreur standardisée pour les API
 */
export function createErrorResponse(error: unknown): {
    success: false;
    error: string;
    code?: string;
} {
    const message = getErrorMessage(error);
    const code = isAppError(error) ? error.code : undefined;

    return {
        success: false,
        error: message,
        ...(code && { code }),
    };
}

/**
 * Récupère le status code approprié pour une erreur
 */
export function getErrorStatusCode(error: unknown): number {
    if (isAppError(error)) {
        return error.statusCode;
    }

    // Pour les erreurs non-opérationnelles, toujours 500
    return 500;
}
