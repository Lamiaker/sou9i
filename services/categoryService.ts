import { prisma } from '@/lib/prisma'

export class CategoryService {
    /**
     * Récupérer toutes les catégories
     */
    static async getAllCategories() {
        return prisma.category.findMany({
            orderBy: {
                order: 'asc',
            },
        })
    }

    /**
     * Récupérer une catégorie par ID
     */
    static async getCategoryById(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        return category
    }

    /**
     * Récupérer une catégorie par slug
     */
    static async getCategoryBySlug(slug: string) {
        const category = await prisma.category.findUnique({
            where: { slug },
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        return category
    }

    /**
     * Récupérer les catégories avec le nombre d'annonces
     */
    static async getCategoriesWithCount() {
        return prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        ads: {
                            where: {
                                status: 'active',
                            },
                        },
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        })
    }

    /**
     * Créer une catégorie
     */
    static async createCategory(data: {
        name: string
        slug: string
        icon?: string
        description?: string
        order?: number
    }) {
        return prisma.category.create({
            data,
        })
    }

    /**
     * Mettre à jour une catégorie
     */
    static async updateCategory(
        id: string,
        data: Partial<{
            name: string
            slug: string
            icon: string
            description: string
            order: number
        }>
    ) {
        return prisma.category.update({
            where: { id },
            data,
        })
    }

    /**
     * Supprimer une catégorie
     */
    static async deleteCategory(id: string) {
        // Vérifier s'il y a des annonces dans cette catégorie
        const adsCount = await prisma.ad.count({
            where: { categoryId: id },
        })

        if (adsCount > 0) {
            throw new Error(
                `Impossible de supprimer : ${adsCount} annonce(s) utilisent cette catégorie`
            )
        }

        return prisma.category.delete({
            where: { id },
        })
    }
}
