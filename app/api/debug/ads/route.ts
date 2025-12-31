import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma'

/**
 * Route de debug pour les annonces
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

        // Récupérer toutes les annonces avec leurs relations
        const ads = await prisma.ad.findMany({
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Récupérer toutes les catégories
        const categories = await prisma.category.findMany({
            include: {
                children: true,
                parent: true,
            }
        });

        return NextResponse.json({
            success: true,
            summary: {
                totalAds: ads.length,
                totalCategories: categories.length,
                adsByStatus: {
                    active: ads.filter(ad => ad.status === 'active').length,
                    pending: ads.filter(ad => ad.status === 'pending').length,
                    sold: ads.filter(ad => ad.status === 'sold').length,
                    deleted: ads.filter(ad => ad.status === 'deleted').length,
                }
            },
            ads: ads.map(ad => ({
                id: ad.id,
                title: ad.title,
                price: ad.price,
                status: ad.status,
                categoryId: ad.categoryId,
                categoryName: ad.category?.name || 'Sans catégorie',
                categorySlug: ad.category?.slug || '-',
                userName: ad.user?.name || 'Anonyme',
                createdAt: ad.createdAt,
            })),
            categories: categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                parentId: cat.parentId,
                parentName: cat.parent?.name || null,
                childrenCount: cat.children?.length || 0,
                childrenNames: cat.children?.map(c => c.name) || [],
            }))
        });
    } catch (error) {
        // Log serveur uniquement, pas de détails au client
        console.error('[DEBUG/ADS]', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur serveur'
        }, { status: 500 });
    }
}
