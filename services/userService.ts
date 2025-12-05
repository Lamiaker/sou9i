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
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                city: true,
                avatar: true,
                isVerified: true,
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
                isVerified: true,
                password: true, // Pour vérification
                createdAt: true,
            },
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
                isVerified: true,
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
                isVerified: true,
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
     * Obtenir les statistiques d'un utilisateur
     */
    static async getUserStats(id: string) {
        const [adsCount, favoritesCount] = await Promise.all([
            prisma.ad.count({ where: { userId: id, status: 'active' } }),
            prisma.favorite.count({ where: { userId: id } }),
        ])

        return {
            adsCount,
            favoritesCount,
        }
    }
}
