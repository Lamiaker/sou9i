import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export class UserService {
    /**
     * Créer un nouvel utilisateur
     */
    static async createUser(data: {
        email: string
        name: string
        password: string
        phone: string
        city: string
    }) {
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existingUser) {
            throw new Error('Cet email est déjà utilisé')
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(data.password, 10)

        // Créer l'utilisateur
        return prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: hashedPassword,
                phone: data.phone,
                city: data.city,
                avatar: '/user.png',
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatar: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                createdAt: true,
            },
        })
    }

    /**
     * Récupérer un utilisateur par email
     */
    static async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatar: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                isTrusted: true,
                rejectionReason: true,
                isBanned: true,
                banReason: true,
                bannedAt: true,
                password: true, // Pour vérification
                createdAt: true,
            } as any,
        })
    }

    /**
     * Récupérer un utilisateur par ID
     */
    static async getUserById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatar: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                isTrusted: true,
                rejectionReason: true,
                isBanned: true,
                banReason: true,
                bannedAt: true,
                createdAt: true,
                _count: {
                    select: {
                        ads: true,
                    }
                }
            },
        })
    }

    /**
     * Vérifier le mot de passe
     */
    static async verifyPassword(password: string, hashedPassword: string) {
        return bcrypt.compare(password, hashedPassword)
    }

    /**
     * Mettre à jour le profil utilisateur
     */
    static async updateUser(
        id: string,
        data: Partial<{
            name: string
            email: string // Allow email update
            phone: string
            city: string
            avatar: string
        }>
    ) {
        return prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatar: true,
                role: true,
                isVerified: true,
                verificationStatus: true,
                createdAt: true,
            },
        })
    }

    /**
     * Changer le mot de passe
     */
    static async changePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { password: true },
        })

        if (!user) {
            throw new Error('Utilisateur non trouvé')
        }

        // Vérifier l'ancien mot de passe
        const isValid = await bcrypt.compare(oldPassword, user.password)
        if (!isValid) {
            throw new Error('Mot de passe incorrect')
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        return prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        })
    }

    /**
     * Mettre à jour le mot de passe (sans vérification de l'ancien)
     * Utilisé après vérification externe
     */
    static async updatePassword(id: string, newPassword: string) {
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        return prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
            select: {
                id: true,
                email: true,
                name: true,
            },
        })
    }

    /**
     * Supprimer un utilisateur
     */
    static async deleteUser(id: string) {
        return prisma.user.delete({
            where: { id },
        })
    }

    /**
     * Obtenir les statistiques complètes d'un utilisateur pour le dashboard
     */
    static async getUserStats(id: string) {
        // Récupérer les annonces actives de l'utilisateur avec leurs vues
        const userAds = await prisma.ad.findMany({
            where: {
                userId: id,
                status: 'active',
                moderationStatus: 'APPROVED'
            },
            select: {
                id: true,
                views: true,
                _count: {
                    select: {
                        favorites: true
                    }
                }
            }
        });

        // Calculer les totaux
        const adsCount = userAds.length;
        const totalViews = userAds.reduce((sum, ad) => sum + (ad.views || 0), 0);
        const favoritesReceived = userAds.reduce((sum, ad) => sum + (ad._count?.favorites || 0), 0);

        // Compter les messages non lus (messages dans les conversations où l'utilisateur participe, non envoyés par lui et non lus)
        const unreadMessages = await prisma.message.count({
            where: {
                read: false,
                senderId: {
                    not: id // Messages non envoyés par l'utilisateur
                },
                conversation: {
                    participants: {
                        some: {
                            id: id // L'utilisateur fait partie de la conversation
                        }
                    }
                }
            }
        });

        // Annonces en attente de modération
        const pendingAds = await prisma.ad.count({
            where: {
                userId: id,
                moderationStatus: 'PENDING'
            }
        });

        // Annonces rejetées
        const rejectedAds = await prisma.ad.count({
            where: {
                userId: id,
                moderationStatus: 'REJECTED'
            }
        });

        // Favoris de l'utilisateur (annonces qu'il a mis en favori)
        const userFavorites = await prisma.favorite.count({
            where: { userId: id }
        });

        return {
            adsCount,           // Annonces actives et approuvées
            totalViews,         // Vues totales de toutes les annonces
            unreadMessages,     // Messages non lus
            favoritesReceived,  // Favoris reçus sur les annonces
            pendingAds,         // Annonces en attente
            rejectedAds,        // Annonces rejetées
            userFavorites,      // Favoris de l'utilisateur
        };
    }
}
