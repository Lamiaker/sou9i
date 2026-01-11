import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isRedisAvailable } from '@/lib/redis';

/**
 * Endpoint de santé pour vérifier l'état des services
 * URL: /api/health
 * 
 * Usage en production:
 * - Monitoring: vérifier que l'app répond
 * - Load balancer: health check
 * - Debugging: diagnostiquer les problèmes de connexion
 */
export async function GET() {
    const startTime = Date.now();

    const health = {
        status: 'ok' as 'ok' | 'degraded' | 'error',
        timestamp: new Date().toISOString(),
        services: {
            database: { status: 'unknown' as string, latency: 0 },
            redis: { status: 'unknown' as string, latency: 0 },
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
    };

    // Vérifier la base de données
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = {
            status: 'connected',
            latency: Date.now() - dbStart,
        };
    } catch (error) {
        health.services.database = {
            status: 'error',
            latency: 0,
        };
        health.status = 'degraded';
    }

    // Vérifier Redis
    try {
        const redisStart = Date.now();
        const redisOk = await isRedisAvailable();
        health.services.redis = {
            status: redisOk ? 'connected' : 'not_configured',
            latency: Date.now() - redisStart,
        };
    } catch (error) {
        health.services.redis = {
            status: 'error',
            latency: 0,
        };
        // Redis n'est pas critique, on reste ok si DB fonctionne
        if (health.status === 'ok' && health.services.database.status !== 'connected') {
            health.status = 'degraded';
        }
    }

    // Déterminer le status final
    if (health.services.database.status !== 'connected') {
        health.status = 'error';
    }

    const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, {
        status: statusCode,
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
    });
}
