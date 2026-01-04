import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'


export class CategoryService {
    /**
     * Récupérer toutes les catégories avec leur hiérarchie
     */
    static async getAllCategories() {
        return unstable_cache(
            async () => {
                return prisma.category.findMany({
                    include: {
                        parent: true,
                        children: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                })
            },
            ['all-categories'],
            { revalidate: 3600, tags: ['categories'] }
        )();
    }

    /**
     * Récupérer toutes les catégories parentes (sans parent)
     */
    static async getParentCategories() {
        return unstable_cache(
            async () => {
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
            },
            ['parent-categories'],
            { revalidate: 3600, tags: ['categories'] }
        )();
    }

    /**
     * Récupérer les catégories marquées comme "Tendance"
     * Avec fallback: utilise category.image ou première image d'annonce
     */
    static async getTrendingCategories() {
        return unstable_cache(
            async () => {
                // Récupérer les catégories marquées comme tendance
                const trendingCategories = await prisma.category.findMany({
                    where: {
                        isTrending: true,
                    },
                    include: {
                        ads: {
                            where: {
                                status: 'active',
                                moderationStatus: 'APPROVED',
                            },
                            select: {
                                images: true,
                            },
                            take: 1, // On ne prend que la première annonce pour l'image fallback
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                        children: {
                            include: {
                                ads: {
                                    where: {
                                        status: 'active',
                                        moderationStatus: 'APPROVED',
                                    },
                                    select: {
                                        images: true,
                                    },
                                    take: 1,
                                    orderBy: {
                                        createdAt: 'desc',
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [
                        { trendingOrder: 'asc' },
                        { name: 'asc' },
                    ],
                });

                // Mapper avec la logique de fallback pour l'image
                return trendingCategories.map(category => {
                    // 1. Utiliser l'image de la catégorie si elle existe
                    let image = category.image;

                    // 2. Sinon, chercher la première image d'annonce de la catégorie
                    if (!image && category.ads.length > 0 && category.ads[0].images.length > 0) {
                        image = category.ads[0].images[0];
                    }

                    // 3. Sinon, chercher dans les sous-catégories
                    if (!image) {
                        for (const child of category.children) {
                            if (child.ads.length > 0 && child.ads[0].images.length > 0) {
                                image = child.ads[0].images[0];
                                break;
                            }
                        }
                    }

                    // 4. Image par défaut si rien trouvé
                    if (!image) {
                        image = '/images/placeholder-category.jpg';
                    }

                    return {
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        image,
                    };
                });
            },
            ['trending-categories'],
            { revalidate: 300, tags: ['categories', 'trending'] }
        )();
    }

    /**
     * Mettre à jour le statut tendance d'une catégorie
     */
    static async updateTrendingStatus(id: string, isTrending: boolean, trendingOrder?: number) {
        return prisma.category.update({
            where: { id },
            data: {
                isTrending,
                trendingOrder: isTrending ? trendingOrder : null,
            },
        });
    }

    /**
     * Récupérer les catégories hiérarchiques (parents avec leurs enfants)
     */
    static async getCategoriesHierarchy() {
        return unstable_cache(
            async () => {
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
            },
            ['categories-hierarchy'],
            { revalidate: 3600, tags: ['categories'] }
        )();
    }

    /**
     * Récupérer les catégories hiérarchiques avec pagination
     */
    static async getCategoriesHierarchyPaginated({
        page = 1,
        limit = 12,
    }: {
        page?: number;
        limit?: number;
    } = {}) {
        const skip = (page - 1) * limit;

        const [parents, total] = await Promise.all([
            prisma.category.findMany({
                where: {
                    parentId: null,
                },
                skip,
                take: limit,
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
            }),
            prisma.category.count({
                where: { parentId: null }
            }),
        ]);

        // Calculer le total des annonces (parent + enfants)
        const categories = parents.map(parent => {
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

        return {
            categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
     * Récupérer les catégories parentes non vides (avec au moins 1 annonce active)
     * Utilisé pour l'affichage dynamique sur la page d'accueil
     */
    static async getCategoriesWithAds(options: {
        skip?: number;
        take?: number;
    } = {}) {
        const { skip = 0, take = 4 } = options;

        return unstable_cache(
            async (s, t) => {
                // Récupérer toutes les catégories parentes avec leur count d'annonces
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
                        },
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
                });

                // Calculer le total des annonces pour chaque catégorie parent (parent + enfants)
                const categoriesWithTotalAds = parents.map(parent => {
                    const childrenAdsCount = parent.children.reduce((acc, child) => {
                        return acc + (child._count?.ads || 0);
                    }, 0);

                    const totalAds = (parent._count?.ads || 0) + childrenAdsCount;

                    return {
                        id: parent.id,
                        name: parent.name,
                        slug: parent.slug,
                        icon: parent.icon,
                        description: parent.description,
                        totalAds,
                    };
                });

                // Filtrer les catégories avec au moins 1 annonce
                const nonEmptyCategories = categoriesWithTotalAds.filter(cat => cat.totalAds > 0);

                // Appliquer la pagination
                const paginatedCategories = nonEmptyCategories.slice(s, s + t);
                const hasMore = nonEmptyCategories.length > s + t;
                const totalRemaining = Math.max(0, nonEmptyCategories.length - (s + t));

                return {
                    categories: paginatedCategories,
                    hasMore,
                    totalRemaining,
                    total: nonEmptyCategories.length,
                };
            },
            [`categories-with-ads-${skip}-${take}`],
            { revalidate: 300, tags: ['categories', 'ads'] }
        )(skip, take);
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
