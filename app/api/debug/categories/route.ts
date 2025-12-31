import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

/**
 * Route de debug pour les catégories
 * ⚠️ PROTÉGÉE - Accessible uniquement aux admins
 * ⚠️ DÉSACTIVÉE EN PRODUCTION pour des raisons de sécurité
 */
export async function GET() {
    try {
        // ✅ SÉCURITÉ: Désactiver complètement en production
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { success: false, error: 'Route non disponible' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur est admin
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 403 }
            );
        }

        // Récupérer les catégories
        const categories = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 20,
        });

        return NextResponse.json({
            success: true,
            environment: 'development',
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        // Log serveur uniquement, pas de détails au client
        logServerError(error, { route: '/api/debug/categories', action: 'debug_categories' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}
