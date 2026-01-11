/**
 * Client Redis pour la production
 * 
 * Utilisé pour :
 * - Rate limiting distribué (plusieurs workers PM2)
 * - Cache partagé
 * - Socket.io adapter (sync entre workers)
 */

import { createClient, RedisClientType } from 'redis';

// Singleton pour le client Redis
let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Configuration Redis depuis les variables d'environnement
 */
function getRedisConfig() {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
        // Format: redis://[:password@]host[:port][/database]
        return { url: redisUrl };
    }

    // Configuration par défaut pour localhost
    return {
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
    };
}

/**
 * Obtient ou crée le client Redis
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
    // En développement sans Redis configuré, retourne null
    if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL && !process.env.REDIS_HOST) {
        return null;
    }

    if (redisClient && isConnected) {
        return redisClient;
    }

    try {
        redisClient = createClient(getRedisConfig()) as RedisClientType;

        redisClient.on('error', (err) => {
            console.error('[Redis] Erreur:', err.message);
            isConnected = false;
        });

        redisClient.on('connect', () => {
            console.log('[Redis] Connecté');
            isConnected = true;
        });

        redisClient.on('disconnect', () => {
            console.log('[Redis] Déconnecté');
            isConnected = false;
        });

        await redisClient.connect();
        return redisClient;
    } catch (error) {
        console.error('[Redis] Erreur de connexion:', error);
        return null;
    }
}

/**
 * Vérifie si Redis est disponible
 */
export async function isRedisAvailable(): Promise<boolean> {
    try {
        const client = await getRedisClient();
        if (!client) return false;

        const pong = await client.ping();
        return pong === 'PONG';
    } catch {
        return false;
    }
}

/**
 * Ferme proprement la connexion Redis
 */
export async function closeRedis(): Promise<void> {
    if (redisClient && isConnected) {
        await redisClient.quit();
        redisClient = null;
        isConnected = false;
    }
}

// ============================================
// Helpers pour le Rate Limiting avec Redis
// ============================================

interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: Date;
    blocked: boolean;
    retryAfter?: number;
}

/**
 * Rate limiting avec Redis (sliding window)
 */
export async function checkRateLimitRedis(
    key: string,
    limit: number,
    windowMs: number
): Promise<RateLimitResult> {
    const client = await getRedisClient();

    // Fallback si Redis n'est pas disponible
    if (!client) {
        return {
            success: true,
            remaining: limit,
            resetAt: new Date(Date.now() + windowMs),
            blocked: false,
        };
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
        // Transaction Redis pour atomicité
        const multi = client.multi();

        // Supprimer les anciennes entrées
        multi.zRemRangeByScore(redisKey, 0, windowStart);

        // Compter les requêtes dans la fenêtre
        multi.zCard(redisKey);

        // Ajouter la requête actuelle
        multi.zAdd(redisKey, { score: now, value: `${now}-${Math.random()}` });

        // Définir l'expiration
        multi.expire(redisKey, Math.ceil(windowMs / 1000));

        const results = await multi.exec();
        // results[1] est le résultat de zCard (nombre d'éléments)
        const count = typeof results[1] === 'number' ? results[1] : Number(results[1]) || 0;

        if (count >= limit) {
            // Trouver le plus ancien timestamp pour calculer le reset
            const oldest = await client.zRange(redisKey, 0, 0, { BY: 'SCORE' });
            const resetTime = oldest.length > 0
                ? parseInt(oldest[0].split('-')[0]) + windowMs
                : now + windowMs;

            return {
                success: false,
                remaining: 0,
                resetAt: new Date(resetTime),
                blocked: false,
                retryAfter: Math.ceil((resetTime - now) / 1000),
            };
        }

        return {
            success: true,
            remaining: limit - count - 1,
            resetAt: new Date(now + windowMs),
            blocked: false,
        };
    } catch (error) {
        console.error('[Redis] Erreur rate limit:', error);
        // En cas d'erreur, on laisse passer (fail open)
        return {
            success: true,
            remaining: limit,
            resetAt: new Date(now + windowMs),
            blocked: false,
        };
    }
}

/**
 * Réinitialise le rate limit pour une clé
 */
export async function resetRateLimitRedis(key: string): Promise<void> {
    const client = await getRedisClient();
    if (client) {
        await client.del(`ratelimit:${key}`);
    }
}

// ============================================
// Helpers pour le Cache
// ============================================

/**
 * Récupère une valeur du cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
    const client = await getRedisClient();
    if (!client) return null;

    try {
        const value = await client.get(`cache:${key}`);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

/**
 * Stocke une valeur dans le cache
 */
export async function cacheSet<T>(
    key: string,
    value: T,
    ttlSeconds: number = 300
): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
        await client.setEx(`cache:${key}`, ttlSeconds, JSON.stringify(value));
    } catch (error) {
        console.error('[Redis] Erreur cache set:', error);
    }
}

/**
 * Supprime une valeur du cache
 */
export async function cacheDelete(key: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
        await client.del(`cache:${key}`);
    } catch (error) {
        console.error('[Redis] Erreur cache delete:', error);
    }
}

/**
 * Supprime toutes les clés correspondant à un pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
    const client = await getRedisClient();
    if (!client) return;

    try {
        const keys = await client.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (error) {
        console.error('[Redis] Erreur cache delete pattern:', error);
    }
}
