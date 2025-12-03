import { prisma } from '@/lib/prisma'

export class FavoriteService {
    /**
     * Récupérer les favoris d'un utilisateur
     */
    static async getUserFavorites(userId: string) {
        return prisma.favorite.findMany({
            where: { userId },
            include: {
                ad: {
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
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
    }

    /**
     * Vérifier si une annonce est en favoris
     */
    static async isFavorite(userId: string, adId: string) {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_adId: {
                    userId,
                    adId,
                },
            },
        })

        return !!favorite
    }

    /**
     * Ajouter aux favoris
     */
    static async addFavorite(userId: string, adId: string) {
        // Vérifier si déjà en favoris
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_adId: {
                    userId,
                    adId,
                },
            },
        })

        if (existing) {
            throw new Error('Déjà en favoris')
        }

        // Vérifier que l'annonce existe
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            select: { id: true },
        })

        if (!ad) {
            throw new Error('Annonce non trouvée')
        }

        return prisma.favorite.create({
            data: {
                userId,
                adId,
            },
            include: {
                ad: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        category: true,
                    },
                },
            },
        })
    }

    /**
     * Retirer des favoris
     */
    static async removeFavorite(userId: string, adId: string) {
        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_adId: {
                    userId,
                    adId,
                },
            },
        })

        if (!favorite) {
            throw new Error('Favori non trouvé')
        }

        return prisma.favorite.delete({
            where: {
                userId_adId: {
                    userId,
                    adId,
                },
            },
        })
    }

    /**
     * Toggle favori (ajouter ou retirer)
     */
    static async toggleFavorite(userId: string, adId: string) {
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_adId: {
                    userId,
                    adId,
                },
            },
        })

        if (existing) {
            await this.removeFavorite(userId, adId)
            return { action: 'removed', isFavorite: false }
        } else {
            await this.addFavorite(userId, adId)
            return { action: 'added', isFavorite: true }
        }
    }

    /**
     * Compter les favoris d'un utilisateur
     */
    static async countUserFavorites(userId: string) {
        return prisma.favorite.count({
            where: { userId },
        })
    }

    /**
     * Obtenir les IDs des favoris d'un utilisateur
     */
    static async getUserFavoriteIds(userId: string): Promise<string[]> {
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            select: { adId: true },
        })

        return favorites.map((f: { adId: string }) => f.adId)
    }
}
