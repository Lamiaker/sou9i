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

    /**
     * Synchroniser les favoris locaux (visiteur) avec le compte utilisateur
     * 
     * @param userId - ID de l'utilisateur authentifié
     * @param localAdIds - Liste des IDs d'annonces stockés localement
     * @returns Résultat de la synchronisation (ajoutés, ignorés, favoris finaux)
     */
    static async syncFavorites(userId: string, localAdIds: string[]): Promise<{
        added: number,
        skipped: number,
        favorites: string[]
    }> {
        let added = 0
        let skipped = 0

        // 1. Récupérer les favoris existants de l'utilisateur
        const existingFavorites = await this.getUserFavoriteIds(userId)
        const existingSet = new Set(existingFavorites)

        // 2. Filtrer les IDs qui ne sont pas déjà en favoris
        const newAdIds = localAdIds.filter(id => !existingSet.has(id))

        // 3. Vérifier quelles annonces existent réellement et sont valides
        const validAds = await prisma.ad.findMany({
            where: {
                id: { in: newAdIds },
                // Optionnel: filtrer uniquement les annonces actives et approuvées
                status: 'active',
                moderationStatus: 'APPROVED'
            },
            select: { id: true }
        })

        const validAdIds = new Set(validAds.map(ad => ad.id))

        // 4. Créer les nouveaux favoris en batch (transaction pour atomicité)
        const favoritesToCreate = newAdIds.filter(id => validAdIds.has(id))

        if (favoritesToCreate.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const adId of favoritesToCreate) {
                    try {
                        await tx.favorite.create({
                            data: {
                                userId,
                                adId,
                            }
                        })
                        added++
                    } catch {
                        // Ignorer les erreurs (doublon possible en cas de race condition)
                        skipped++
                    }
                }
            })
        }

        // 5. Calculer les favoris ignorés (doublons + annonces invalides)
        skipped += (localAdIds.length - newAdIds.length) // Doublons existants
        skipped += (newAdIds.length - favoritesToCreate.length) // Annonces invalides

        // 6. Retourner les favoris finaux
        const finalFavorites = await this.getUserFavoriteIds(userId)

        return {
            added,
            skipped,
            favorites: finalFavorites
        }
    }
}

