import crypto from 'crypto';

/**
 * Génère un token cryptographiquement sécurisé
 * @returns Token en format base64url (safe pour URL)
 */
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hash un token avec SHA-256 pour stockage sécurisé
 * @param token - Token en clair
 * @returns Hash du token
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Calcule la date d'expiration
 * @param hours - Nombre d'heures avant expiration (défaut: 1)
 * @returns Date d'expiration
 */
export function getExpirationDate(hours: number = 1): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Vérifie si une date est expirée
 * @param expiresAt - Date d'expiration à vérifier
 * @returns true si expiré
 */
export function isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
}
