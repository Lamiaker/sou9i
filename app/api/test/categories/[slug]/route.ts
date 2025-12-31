import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Route de test pour les catégories par slug
 * ⚠️ PROTÉGÉE - Accessible uniquement aux admins
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Vérifier que l'utilisateur est admin
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 403 }
            );
        }

        const { slug } = await params;

        // Récupérer la catégorie
        const category = await prisma.category.findUnique({
            where: { slug },
        });

        if (!category) {
            return NextResponse.json({
                success: false,
                error: 'Catégorie non trouvée',
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        // Log serveur uniquement, pas de détails au client
        console.error('[TEST/CATEGORIES]', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur serveur',
        }, { status: 500 });
    }
}
