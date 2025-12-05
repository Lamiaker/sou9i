import { prisma } from '@/lib/prisma'
import type { AdFilters } from '@/lib/prisma-types'

export class AdService {
    /**
     * Récupérer toutes les annonces avec filtres et pagination
     */
    static async getAds(
        filters: AdFilters = {},
        page: number = 1,
        limit: number = 12
    ) {
        const where: any = {
            status: filters.status || 'active',
        }

        // Filtres
        if (filters.categoryId) {
            // Récupérer la catégorie et ses enfants
            const category = await prisma.category.findUnique({
                where: { id: filters.categoryId },
                include: {
                    children: {
                        select: { id: true }
                    }
                }
            });

            if (category) {
                // Si la catégorie a des enfants, chercher dans la catégorie ET ses sous-catégories
                if (category.children && category.children.length > 0) {
                    const categoryIds = [category.id, ...category.children.map(c => c.id)];
                    where.categoryId = {
                        in: categoryIds
                    };
                } else {
                    // Sinon, juste la catégorie
                    where.categoryId = filters.categoryId;
                }
            } else {
                // Catégorie non trouvée, utiliser l'ID fourni
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

        // Pagination
        const skip = (page - 1) * limit

        // Exécution parallèle des requêtes
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
                        isVerified: true,
                        createdAt: true,
                    },
                },
                category: true,
                favorites: {
                    select: {
                        userId: true,
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
        condition?: string
        brand?: string
        size?: string
        deliveryAvailable?: boolean
        negotiable?: boolean
    }) {
        return prisma.ad.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                location: data.location,
                condition: data.condition,
                brand: data.brand,
                size: data.size,
                images: data.images || [],
                deliveryAvailable: data.deliveryAvailable || false,
                negotiable: data.negotiable !== undefined ? data.negotiable : true,
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

    /**
     * Supprimer une annonce
     */
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

        return prisma.ad.delete({
            where: { id },
        })
    }

    /**
     * Obtenir les annonces d'un utilisateur
     */
    static async getUserAds(userId: string, status?: string) {
        const where: any = { userId }
        if (status) {
            where.status = status
        }

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
}
