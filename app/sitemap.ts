import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Configuration du site
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sweetlook.dz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Date actuelle pour lastModified
    const now = new Date();

    // Pages statiques principales
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/categories`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/faq`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/conditions`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/confidentialite`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Récupérer toutes les catégories avec la date de la dernière annonce
    let categoryPages: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            include: {
                ads: {
                    where: {
                        status: 'active',
                        moderationStatus: 'APPROVED'
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    take: 1,
                    select: {
                        updatedAt: true
                    }
                }
            }
        });

        categoryPages = categories.map((category) => {
            const lastAddDate = category.ads[0]?.updatedAt || category.createdAt;
            return {
                url: `${BASE_URL}/categories/${category.slug}`,
                lastModified: lastAddDate,
                changeFrequency: 'daily' as const, // Les catégories changent souvent
                priority: 0.8,
            };
        });
    } catch (error) {
        console.error('Error fetching categories for sitemap:', error);
    }

    // Récupérer toutes les annonces actives et approuvées
    let adPages: MetadataRoute.Sitemap = [];
    try {
        const ads = await prisma.ad.findMany({
            where: {
                status: 'active',
                moderationStatus: 'APPROVED',
            },
            select: {
                id: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            // Limiter à 10000 pour éviter les timeouts (Google recommande < 50000)
            take: 10000,
        });

        adPages = ads.map((ad) => ({
            url: `${BASE_URL}/annonces/${ad.id}`,
            lastModified: ad.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        console.error('Error fetching ads for sitemap:', error);
    }

    // Combiner toutes les pages
    return [...staticPages, ...categoryPages, ...adPages];
}
