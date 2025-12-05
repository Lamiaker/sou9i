import { prisma } from '@/lib/prisma'

export class CategoryService {
    /**
     * Récupérer toutes les catégories avec leur hiérarchie
     */
    static async getAllCategories() {
        return prisma.category.findMany({
            include: {
                parent: true,
                children: true,
            },
            orderBy: {
                order: 'asc',
            },
        })
    }

    /**
     * Récupérer toutes les catégories parentes (sans parent)
     */
    static async getParentCategories() {
        return prisma.category.findMany({
            where: {
                parentId: null,
            },
            include: {
                children: {
                    orderBy: {
                        name: 'asc',
                    },
                },
                _count: {
                    select: {
                        ads: true,
                        children: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        })
    }

    /**
     * Récupérer les catégories hiérarchiques (parents avec leurs enfants)
     */
    static async getCategoriesHierarchy() {
        const parents = await prisma.category.findMany({
            where: {
                parentId: null,
            },
            include: {
                children: {
                    include: {
                        _count: {
                            select: {
                                ads: {
                                    where: {
                                        status: 'active',
                                    }
                                },
                            },
                        },
                    },
                    orderBy: {
                        name: 'asc',
                    },
                },
                _count: {
                    select: {
                        ads: {
                            where: {
                                status: 'active',
                            },
                        },
                        children: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        })

        // Calculer le total des annonces (parent + enfants)
        return parents.map(parent => {
            const childrenAdsCount = parent.children.reduce((acc, child) => {
                return acc + (child._count?.ads || 0);
            }, 0);

            return {
                ...parent,
                _count: {
                    ...parent._count,
                    ads: (parent._count?.ads || 0) + childrenAdsCount
                }
            };
        });
    }

    /**
     * Récupérer une catégorie par ID avec ses relations
     */
    static async getCategoryById(id: string, includeRelations = true) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: includeRelations ? {
                parent: true,
                children: true,
                _count: {
                    select: {
                        ads: true,
                        children: true,
                    },
                },
            } : undefined,
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        return category
    }

    /**
     * Récupérer une catégorie par slug avec ses relations
     */
    static async getCategoryBySlug(slug: string, includeRelations = true) {
        const category = await prisma.category.findUnique({
            where: { slug },
            include: includeRelations ? {
                parent: true,
                children: true,
                _count: {
                    select: {
                        ads: true,
                        children: true,
                    },
                },
            } : undefined,
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        return category
    }

    /**
     * Récupérer les enfants d'une catégorie
     */
    static async getCategoryChildren(parentId: string) {
        return prisma.category.findMany({
            where: {
                parentId,
            },
            include: {
                _count: {
                    select: {
                        ads: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        })
    }

    /**
     * Récupérer les catégories avec le nombre d'annonces
     */
    static async getCategoriesWithCount() {
        return prisma.category.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: {
                        ads: {
                            where: {
                                status: 'active',
                            },
                        },
                        children: true,
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
        parentId?: string
    }) {
        // Vérifier que le slug n'existe pas déjà
        const existing = await prisma.category.findUnique({
            where: { slug: data.slug },
        })

        if (existing) {
            throw new Error('Une catégorie avec ce slug existe déjà')
        }

        return prisma.category.create({
            data,
            include: {
                parent: true,
                children: true,
            },
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
            parentId: string
        }>
    ) {
        // Vérifier que la catégorie existe
        const category = await prisma.category.findUnique({
            where: { id },
        })

        if (!category) {
            throw new Error('Catégorie non trouvée')
        }

        // Si on change le slug, vérifier qu'il n'existe pas déjà
        if (data.slug && data.slug !== category.slug) {
            const existing = await prisma.category.findUnique({
                where: { slug: data.slug },
            })

            if (existing) {
                throw new Error('Une catégorie avec ce slug existe déjà')
            }
        }

        return prisma.category.update({
            where: { id },
            data,
            include: {
                parent: true,
                children: true,
            },
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

        // Vérifier s'il y a des sous-catégories
        const childrenCount = await prisma.category.count({
            where: { parentId: id },
        })

        if (childrenCount > 0) {
            throw new Error(
                `Impossible de supprimer : cette catégorie a ${childrenCount} sous-catégorie(s)`
            )
        }

        return prisma.category.delete({
            where: { id },
        })
    }
}
