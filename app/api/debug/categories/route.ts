import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Route de debug pour les catégories
 * ⚠️ PROTÉGÉE - Accessible uniquement aux admins
 */
export async function GET() {
    try {
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
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        // Log serveur uniquement, pas de détails au client
        console.error('[DEBUG/CATEGORIES]', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
