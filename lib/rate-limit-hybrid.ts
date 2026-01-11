/**
 * Rate Limiting hybride (Redis avec fallback mémoire)
 * 
 * Ce module fournit des fonctions de rate limiting qui :
 * - Utilisent Redis en production (distribué entre workers PM2)
 * - Fallback sur la mémoire en développement ou si Redis indisponible
 */

import { checkRateLimitRedis, resetRateLimitRedis, isRedisAvailable } from './redis';
import { createRateLimiter, getClientIP } from './rate-limit-enhanced';

// Re-export getClientIP pour les routes API
export { getClientIP };

interface HybridRateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: Date;
    blocked: boolean;
    retryAfter?: number;
}

// Cache pour savoir si Redis est disponible (évite les checks répétés)
let redisAvailable: boolean | null = null;
let lastRedisCheck = 0;
const REDIS_CHECK_INTERVAL = 60000; // Vérifier toutes les minutes

async function checkRedisAvailability(): Promise<boolean> {
    const now = Date.now();
    if (redisAvailable !== null && now - lastRedisCheck < REDIS_CHECK_INTERVAL) {
        return redisAvailable;
    }

    redisAvailable = await isRedisAvailable();
    lastRedisCheck = now;
    return redisAvailable;
}

// Rate limiters en mémoire (fallback)
const memoryLimiters = {
    auth: createRateLimiter('auth:hybrid', {
        limit: 5,
        windowMs: 60 * 1000,
        blockDurationMs: 15 * 60 * 1000,
        maxViolations: 3,
    }),
    signup: createRateLimiter('signup:hybrid', {
        limit: 3,
        windowMs: 60 * 1000,
        blockDurationMs: 15 * 60 * 1000,
        maxViolations: 2,
    }),
    passwordReset: createRateLimiter('password-reset:hybrid', {
        limit: 3,
        windowMs: 60 * 60 * 1000,
    }),
    api: createRateLimiter('api:hybrid', {
        limit: 100,
        windowMs: 60 * 1000,
    }),
    messages: createRateLimiter('messages:hybrid', {
        limit: 30,
        windowMs: 60 * 1000,
    }),
    adCreation: createRateLimiter('ad-creation:hybrid', {
        limit: 10,
        windowMs: 60 * 60 * 1000,
    }),
    reports: createRateLimiter('reports:hybrid', {
        limit: 5,
        windowMs: 60 * 60 * 1000,
    }),
    changePassword: createRateLimiter('change-password:hybrid', {
        limit: 5,
        windowMs: 60 * 60 * 1000,
    }),
    support: createRateLimiter('support:hybrid', {
        limit: 10,
        windowMs: 60 * 60 * 1000,
    }),
    favorites: createRateLimiter('favorites:hybrid', {
        limit: 200,
        windowMs: 60 * 1000,
    }),
    conversations: createRateLimiter('conversations:hybrid', {
        limit: 20,
        windowMs: 60 * 60 * 1000,
    }),
};

type RateLimitType = keyof typeof memoryLimiters;

// Configuration des limites
const rateLimitConfigs: Record<RateLimitType, { limit: number; windowMs: number }> = {
    auth: { limit: 5, windowMs: 60 * 1000 },
    signup: { limit: 3, windowMs: 60 * 1000 },
    passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 },
    api: { limit: 100, windowMs: 60 * 1000 },
    messages: { limit: 30, windowMs: 60 * 1000 },
    adCreation: { limit: 10, windowMs: 60 * 60 * 1000 },
    reports: { limit: 5, windowMs: 60 * 60 * 1000 },
    changePassword: { limit: 5, windowMs: 60 * 60 * 1000 },
    support: { limit: 10, windowMs: 60 * 60 * 1000 },
    favorites: { limit: 200, windowMs: 60 * 1000 },
    conversations: { limit: 20, windowMs: 60 * 60 * 1000 },
};

/**
 * Vérifie le rate limit de manière hybride (Redis ou mémoire)
 */
export async function checkRateLimit(
    type: RateLimitType,
    identifier: string
): Promise<HybridRateLimitResult> {
    const config = rateLimitConfigs[type];
    const key = `${type}:${identifier}`;

    // Essayer Redis en premier
    if (await checkRedisAvailability()) {
        try {
            return await checkRateLimitRedis(key, config.limit, config.windowMs);
        } catch (error) {
            console.error('[RateLimit] Erreur Redis, fallback mémoire:', error);
            redisAvailable = false;
        }
    }

    // Fallback sur le rate limiter en mémoire
    return memoryLimiters[type].check(identifier);
}

/**
 * Réinitialise le rate limit pour un identifiant
 */
export async function resetRateLimit(
    type: RateLimitType,
    identifier: string
): Promise<void> {
    const key = `${type}:${identifier}`;

    if (await checkRedisAvailability()) {
        try {
            await resetRateLimitRedis(key);
        } catch (error) {
            console.error('[RateLimit] Erreur reset Redis:', error);
        }
    }

    // Toujours reset le limiter mémoire aussi
    memoryLimiters[type].reset(identifier);
}

// ============================================
// Fonctions spécialisées pour chaque use case
// ============================================

/**
 * Rate limit pour l'authentification (login)
 */
export async function checkAuthRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('auth', ip);
}

export async function resetAuthRateLimit(ip: string): Promise<void> {
    return resetRateLimit('auth', ip);
}

/**
 * Rate limit pour l'inscription
 */
export async function checkSignupRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('signup', ip);
}

export async function resetSignupRateLimit(ip: string): Promise<void> {
    return resetRateLimit('signup', ip);
}

/**
 * Rate limit pour la réinitialisation de mot de passe
 */
export async function checkPasswordResetRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('passwordReset', ip);
}

/**
 * Rate limit pour les messages
 */
export async function checkMessageRateLimit(userId: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('messages', userId);
}

/**
 * Rate limit pour la création d'annonces
 */
export async function checkAdCreationRateLimit(userId: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('adCreation', userId);
}

/**
 * Rate limit pour les signalements
 */
export async function checkReportRateLimit(userId: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('reports', userId);
}

/**
 * Rate limit générique pour les API publiques
 */
export async function checkApiRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('api', ip);
}

/**
 * Rate limit pour le changement de mot de passe
 */
export async function checkChangePasswordRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('changePassword', ip);
}

/**
 * Rate limit pour le support
 */
export async function checkSupportRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('support', ip);
}

/**
 * Rate limit pour les favoris
 */
export async function checkFavoritesRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('favorites', ip);
}

/**
 * Rate limit pour les conversations
 */
export async function checkConversationRateLimit(ip: string): Promise<HybridRateLimitResult> {
    return checkRateLimit('conversations', ip);
}
