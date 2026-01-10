import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { AdStatus, type AdFilters } from '@/types'
import { SubcategoryFieldService, type FieldValueInput } from './subcategoryFieldService'
import fs from 'fs'
import path from 'path'

/**
 * Supprimer les fichiers images d'une annonce du système de fichiers
 */
async function deleteAdImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    for (const imageUrl of imageUrls) {
        try {
            if (imageUrl.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), 'public', imageUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Image supprimée: ${filePath}`);
                }
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression de l'image ${imageUrl}:`, error);
        }
    }
}

export class AdService {
    /**
     * Récupérer toutes les annonces avec filtres et pagination
     */
    static async getAds(
        filters: AdFilters & { moderationStatus?: string } = {},
        page: number = 1,
        limit: number = 12
    ) {
        // Ne cacher QUE les requêtes publiques (APPROVED + active)
        const isPublicQuery = (!filters.moderationStatus || filters.moderationStatus === 'APPROVED') &&
            (!filters.status || filters.status === 'active') &&
            !filters.userId;

        if (!isPublicQuery) {
            return this._getAdsInternal(filters, page, limit);
        }

        // Créer une clé de cache basée sur les filtres et la pagination
        const cacheKey = `ads-list-${JSON.stringify(filters)}-${page}-${limit}`;

        return unstable_cache(
            async () => this._getAdsInternal(filters, page, limit),
            [cacheKey],
            { revalidate: 60, tags: ['ads'] }
        )();
    }

    /**
     * Logique interne de récupération des annonces (non cachée directement)
     */
    private static async _getAdsInternal(
        filters: AdFilters & { moderationStatus?: string } = {},
        page: number = 1,
        limit: number = 12
    ) {
        const where: any = {};

        // Gestion de la modération
        if (filters.moderationStatus) {
            if (filters.moderationStatus !== 'ALL') {
                where.moderationStatus = filters.moderationStatus;
            }
        } else {
            where.moderationStatus = 'APPROVED';
        }

        // Gestion du status
        if (filters.status) {
            if (filters.status.includes(',')) {
                where.status = { in: filters.status.split(',') };
            } else {
                where.status = filters.status;
            }
        } else {
            where.status = 'active';
        }

        // Filtres
        if (filters.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: filters.categoryId },
                include: {
                    children: {
                        select: { id: true }
                    }
                }
            });

            if (category) {
                if (category.children && category.children.length > 0) {
                    const categoryIds = [category.id, ...category.children.map(c => c.id)];
                    where.categoryId = { in: categoryIds };
                } else {
                    where.categoryId = filters.categoryId;
                }
            } else {
                where.categoryId = filters.categoryId;
            }
        }

        if (filters.minPrice || filters.maxPrice) {
            where.price = {}
            if (filters.minPrice) where.price.gte = filters.minPrice
            if (filters.maxPrice) where.price.lte = filters.maxPrice
        }

        if (filters.location) {
            where.location = {
                contains: filters.location,
                mode: 'insensitive',
            }
        }

        if (filters.condition) {
            where.condition = filters.condition
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ]
        }

        if (filters.userId) {
            where.userId = filters.userId
        }

        const skip = (page - 1) * limit

        const [ads, total] = await Promise.all([
            prisma.ad.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            city: true,
                            isVerified: true,
                            verificationStatus: true,
                            isTrusted: true
                        },
                    },
                    category: true,
                    _count: {
                        select: {
                            favorites: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.ad.count({ where }),
        ])

        return {
            ads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Récupérer une annonce par ID
     */
    static async getAdById(id: string) {
        const ad = await prisma.ad.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        city: true,
                        phone: true,
                        isVerified: true,
                        verificationStatus: true,
                        isTrusted: true,
                        createdAt: true,
                    },
                },
                category: true,
                favorites: {
                    select: {
                        userId: true,
                    },
                },
                dynamicFields: {
                    include: {
                        field: true,
                    },
                    orderBy: {
                        field: {
                            order: 'asc',
                        },
                    },
                },
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
        })

        if (!ad) {
            throw new Error('Annonce non trouvée')
        }

        return ad
    }

    /**
     * Incrémenter les vues d'une annonce
     */
    static async incrementViews(id: string) {
        return prisma.ad.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        })
    }

    /**
     * Créer une nouvelle annonce
     */
    static async createAd(data: {
        title: string
        description: string
        price: number
        categoryId: string
        userId: string
        images?: string[]
        location: string
        contactPhone?: string | null
        condition?: string
        brand?: string
        size?: string
        deliveryAvailable?: boolean
        negotiable?: boolean
        dynamicFields?: FieldValueInput[]
    }) {
        // ✅ IDEMPOTENCE: Vérifier si une annonce identique a été créée il y a moins de 30 secondes
        const lastDuplicate = await prisma.ad.findFirst({
            where: {
                userId: data.userId,
                title: data.title,
                price: data.price,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 1000) // 30 secondes
                }
            }
        });

        if (lastDuplicate) {
            console.warn(`Tentative de création d'annonce en double détectée pour userId: ${data.userId}`);
            return this.getAdById(lastDuplicate.id); // On retourne l'originale au lieu de recréer
        }

        // Vérifier si l'utilisateur est de confiance (Trusted)
        const user = await prisma.user.findUnique({
            where: { id: data.userId },
            select: { isTrusted: true }
        });

        const moderationStatus = user?.isTrusted ? AdStatus.APPROVED : AdStatus.PENDING;

        // Créer l'annonce
        const ad = await prisma.ad.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                location: data.location,
                contactPhone: data.contactPhone || null,
                condition: data.condition,
                brand: data.brand,
                size: data.size,
                images: data.images || [],
                deliveryAvailable: data.deliveryAvailable || false,
                negotiable: data.negotiable !== undefined ? data.negotiable : true,
                moderationStatus: moderationStatus,
                user: {
                    connect: { id: data.userId },
                },
                category: {
                    connect: { id: data.categoryId },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        city: true,
                    },
                },
                category: true,
            },
        })

        // Sauvegarder les champs dynamiques si fournis
        if (data.dynamicFields && data.dynamicFields.length > 0) {
            await SubcategoryFieldService.saveAdFieldValues(ad.id, data.dynamicFields)
        }

        // Retourner l'annonce avec les champs dynamiques
        return this.getAdById(ad.id)
    }

    /**
     * Mettre à jour une annonce
     */
    static async updateAd(
        id: string,
        userId: string,
        data: Partial<{
            title: string
            description: string
            price: number
            status: string
            location: string
            condition: string
            brand: string
            size: string
            images: string[]
            deliveryAvailable: boolean
            negotiable: boolean
        }>
    ) {
        // Vérifier que l'utilisateur est le propriétaire
        const ad = await prisma.ad.findUnique({
            where: { id },
            select: { userId: true },
        })

        if (!ad) {
            throw new Error('Annonce non trouvée')
        }

        if (ad.userId !== userId) {
            throw new Error('Non autorisé')
        }

        // Si on change des champs sensibles, on devrait peut-être remettre en PENDING ?
        // Pour l'instant on garde simple.

        return prisma.ad.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        city: true,
                    },
                },
                category: true,
            },
        })
    }


    static async deleteAd(id: string, userId: string) {
        // Vérifier que l'utilisateur est le propriétaire
        const ad = await prisma.ad.findUnique({
            where: { id },
            select: { userId: true },
        })

        if (!ad) {
            throw new Error('Annonce non trouvée')
        }

        if (ad.userId !== userId) {
            throw new Error('Non autorisé')
        }

        return prisma.ad.update({
            where: { id },
            data: { status: 'deleted' },
        })
    }

    /**
     * Obtenir les annonces d'un utilisateur
     */
    static async getUserAds(userId: string, status?: string) {
        const where: any = { userId }
        if (status) {
            where.status = status
        } else {
            // Par défaut, ne pas afficher les annonces supprimées (Soft Delete)
            where.status = { not: 'deleted' }
        }

        // Pour ses propres annonces, l'utilisateur veut tout voir, quel que soit le moderationStatus
        // Donc on ne filtre pas sur moderationStatus ici par défaut

        return prisma.ad.findMany({
            where,
            include: {
                category: true,
                _count: {
                    select: {
                        favorites: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }


    static async getPopularAdIds(limit: number = 50): Promise<string[]> {
        try {
            const ads = await prisma.ad.findMany({
                where: {
                    status: 'active',
                    moderationStatus: 'APPROVED',
                },
                select: {
                    id: true,
                },
                orderBy: [
                    { views: 'desc' },
                    { createdAt: 'desc' },
                ],
                take: limit,
            });

            return ads.map(ad => ad.id);
        } catch (error) {
            console.error('Error fetching popular ad IDs:', error);
            return [];
        }
    }
}
