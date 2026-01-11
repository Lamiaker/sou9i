/**
 * Système de Rate Limiting amélioré (version mémoire)
 * 
 * Ce rate limiter en mémoire est utilisé comme fallback.
 * En production avec PM2 cluster, utilisez les fonctions Redis de lib/redis.ts :
 * - checkRateLimitRedis() pour le rate limiting distribué
 * - resetRateLimitRedis() pour réinitialiser
 * 
 * Le rate limiting en mémoire fonctionne bien en développement
 * et pour les cas où Redis n'est pas disponible.
 */

interface RateLimitEntry {
    count: number
    resetTime: number
    blocked: boolean
    blockUntil?: number
}

interface RateLimitConfig {
    /** Nombre maximum de requêtes autorisées dans la fenêtre */
    limit: number
    /** Durée de la fenêtre en millisecondes */
    windowMs: number
    /** Message d'erreur personnalisé */
    message?: string
    /** Durée du blocage après dépassement (optionnel, en ms) */
    blockDurationMs?: number
    /** Nombre de dépassements avant blocage prolongé */
    maxViolations?: number
}

interface RateLimitResult {
    success: boolean
    remaining: number
    resetAt: Date
    blocked: boolean
    retryAfter?: number // en secondes
}

// Stockage global des limites par route/action
const rateLimitStores = new Map<string, Map<string, RateLimitEntry>>()

// Stockage des violations pour le blocage progressif
const violationsStore = new Map<string, number>()

/**
 * Nettoie périodiquement les entrées expirées
 */
function cleanupExpiredEntries(store: Map<string, RateLimitEntry>): void {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
        if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
            store.delete(key)
        }
    }
}

/**
 * Crée un rate limiter pour une route/action spécifique
 */
export function createRateLimiter(name: string, config: RateLimitConfig) {
    // Créer ou récupérer le store pour cette route
    if (!rateLimitStores.has(name)) {
        rateLimitStores.set(name, new Map())
    }
    const store = rateLimitStores.get(name)!

    // Nettoyage périodique (toutes les 60 secondes max)
    let lastCleanup = Date.now()

    return {
        /**
         * Vérifie et incrémente le compteur pour un identifiant (IP, userId, etc.)
         */
        check(identifier: string): RateLimitResult {
            const now = Date.now()

            // Nettoyage périodique
            if (now - lastCleanup > 60000) {
                cleanupExpiredEntries(store)
                lastCleanup = now
            }

            let entry = store.get(identifier)

            // Si pas d'entrée ou fenêtre expirée, créer une nouvelle entrée
            if (!entry || entry.resetTime < now) {
                // Vérifier si toujours bloqué
                if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
                    return {
                        success: false,
                        remaining: 0,
                        resetAt: new Date(entry.blockUntil),
                        blocked: true,
                        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
                    }
                }

                entry = {
                    count: 0,
                    resetTime: now + config.windowMs,
                    blocked: false,
                }
                store.set(identifier, entry)
            }

            // Vérifier si bloqué
            if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
                return {
                    success: false,
                    remaining: 0,
                    resetAt: new Date(entry.blockUntil),
                    blocked: true,
                    retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
                }
            }

            // Incrémenter le compteur
            entry.count++

            // Vérifier la limite
            if (entry.count > config.limit) {
                // Incrémenter les violations
                const violationKey = `${name}:${identifier}`
                const violations = (violationsStore.get(violationKey) || 0) + 1
                violationsStore.set(violationKey, violations)

                // Si trop de violations, bloquer plus longtemps
                if (config.blockDurationMs && config.maxViolations && violations >= config.maxViolations) {
                    // Blocage prolongé (exponentiel)
                    const blockDuration = config.blockDurationMs * Math.pow(2, Math.min(violations - config.maxViolations, 5))
                    entry.blocked = true
                    entry.blockUntil = now + blockDuration

                    return {
                        success: false,
                        remaining: 0,
                        resetAt: new Date(entry.blockUntil),
                        blocked: true,
                        retryAfter: Math.ceil(blockDuration / 1000),
                    }
                }

                return {
                    success: false,
                    remaining: 0,
                    resetAt: new Date(entry.resetTime),
                    blocked: false,
                    retryAfter: Math.ceil((entry.resetTime - now) / 1000),
                }
            }

            return {
                success: true,
                remaining: config.limit - entry.count,
                resetAt: new Date(entry.resetTime),
                blocked: false,
            }
        },

        /**
         * Réinitialise le compteur pour un identifiant (après succès par exemple)
         */
        reset(identifier: string): void {
            store.delete(identifier)
            violationsStore.delete(`${name}:${identifier}`)
        },

        /**
         * Vérifie sans incrémenter (peek)
         */
        peek(identifier: string): RateLimitResult {
            const entry = store.get(identifier)
            const now = Date.now()

            if (!entry || entry.resetTime < now) {
                return {
                    success: true,
                    remaining: config.limit,
                    resetAt: new Date(now + config.windowMs),
                    blocked: false,
                }
            }

            if (entry.blocked && entry.blockUntil && entry.blockUntil > now) {
                return {
                    success: false,
                    remaining: 0,
                    resetAt: new Date(entry.blockUntil),
                    blocked: true,
                    retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
                }
            }

            return {
                success: entry.count < config.limit,
                remaining: Math.max(0, config.limit - entry.count),
                resetAt: new Date(entry.resetTime),
                blocked: false,
            }
        },
    }
}

// ============================================
// Rate limiters préconfigurés pour l'application
// ============================================

/**
 * Rate limiter pour l'authentification (login)
 * - 5 tentatives par minute par IP
 * - Blocage de 15 minutes après 10 échecs consécutifs
 */
export const authRateLimiter = createRateLimiter('auth', {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
    maxViolations: 3, // 3 dépassements = blocage
    message: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
})

/**
 * Rate limiter pour la création d'annonces
 * - 10 annonces par heure par utilisateur
 */
export const adCreationRateLimiter = createRateLimiter('ad-creation', {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: "Vous avez atteint la limite de création d'annonces. Réessayez dans 1 heure.",
})

/**
 * Rate limiter pour les messages
 * - 30 messages par minute par utilisateur
 */
export const messageRateLimiter = createRateLimiter('messages', {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    message: 'Vous envoyez trop de messages. Veuillez patienter.',
})

/**
 * Rate limiter pour les signalements
 * - 5 signalements par heure par utilisateur
 */
export const reportRateLimiter = createRateLimiter('reports', {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: 'Vous avez atteint la limite de signalements.',
})

/**
 * Rate limiter pour la réinitialisation de mot de passe
 * - 3 demandes par heure par email
 */
export const passwordResetRateLimiter = createRateLimiter('password-reset', {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 60 * 60 * 1000, // 1 heure de blocage
    maxViolations: 2,
    message: 'Trop de demandes de réinitialisation. Veuillez réessayer plus tard.',
})

/**
 * Rate limiter générique pour les API publiques
 * - 100 requêtes par minute par IP
 */
export const apiRateLimiter = createRateLimiter('api', {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Trop de requêtes. Veuillez patienter.',
})

/**
 * Helper pour extraire l'IP d'une requête
 */
export function getClientIP(request: Request): string {
    // Headers Vercel/Cloudflare
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIP = request.headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    // Fallback
    return 'unknown'
}
