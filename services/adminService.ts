import { prisma } from '@/lib/prisma'

// Helper function to serialize dates to strings for API responses
function serializeDates<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) return obj.toISOString() as any;
    if (Array.isArray(obj)) return obj.map(serializeDates) as any;
    if (typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, serializeDates(value)])
        ) as T;
    }
    return obj;
}

export class AdminService {
    // ============================================
    // DASHBOARD STATS
    // ============================================

    /**
     * Récupérer les statistiques du dashboard admin
     */
    static async getDashboardStats() {
        const [
            totalUsers,
            newUsersThisMonth,
            totalAds,
            activeAds,
            pendingReports,
            totalCategories,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setDate(1)), // Premier jour du mois
                    },
                },
            }),
            prisma.ad.count(),
            prisma.ad.count({ where: { status: 'active' } }),
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.category.count(),
        ])

        return {
            totalUsers,
            newUsersThisMonth,
            totalAds,
            activeAds,
            pendingReports,
            totalCategories,
        }
    }

    /**
     * Récupérer les dernières activités
     */
    static async getRecentActivity() {
        const [recentUsers, recentAds, recentReports] = await Promise.all([
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    avatar: true,
                },
            }),
            prisma.ad.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    images: true,
                    createdAt: true,
                    user: {
                        select: { name: true },
                    },
                } as any,
            }),
            prisma.report.findMany({
                take: 5,
                where: { status: 'PENDING' },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    reason: true,
                    createdAt: true,
                    reporter: {
                        select: { name: true },
                    },
                },
            }),
        ])

        return { recentUsers, recentAds, recentReports }
    }

    // ============================================
    // GESTION DES UTILISATEURS
    // ============================================

    /**
     * Récupérer la liste des utilisateurs avec pagination et filtres
     */
    /**
     * Récupérer la liste des utilisateurs avec pagination et filtres
     */
    static async getUsers({
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = '', // Remplace 'verified' par 'status' (VerificationStatus)
    }: {
        page?: number
        limit?: number
        search?: string
        role?: string
        status?: string
    }) {
        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (role && (role === 'USER' || role === 'ADMIN')) {
            where.role = role
        }

        if (status) {
            // Pour les onglets spécifiques, on exclut les admins pour ne pas polluer les listes de validation
            where.role = { not: 'ADMIN' };

            if (status === 'BANNED') {
                where.isBanned = true;
            } else {
                where.verificationStatus = status;
                where.isBanned = false;
            }
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    city: true,
                    avatar: true,
                    role: true,
                    verificationStatus: true,
                    isTrusted: true,
                    isBanned: true,
                    banReason: true,
                    rejectionReason: true,
                    createdAt: true,
                    _count: {
                        select: { ads: true },
                    },
                } as any,
            }),
            prisma.user.count({ where }),
        ])

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Vérifier un utilisateur (badge vérifié)
     * Si 'trusted' est vrai, l'utilisateur est considéré comme de confiance (annonces auto-validées)
     */
    static async verifyUser(userId: string, trusted: boolean = false) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true, // Legacy support
                verificationStatus: trusted ? 'TRUSTED' : 'VERIFIED',
                isTrusted: trusted
            } as any,
        })
    }

    /**
     * Rejeter un utilisateur avec une raison
     */
    static async rejectUser(userId: string, reason: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: false,
                verificationStatus: 'REJECTED',
                isTrusted: false,
                rejectionReason: reason
            } as any,
        })
    }

    /**
     * Retirer la vérification d'un utilisateur (reset à PENDING)
     */
    static async unverifyUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: false,
                verificationStatus: 'PENDING',
                isTrusted: false,
                rejectionReason: null
            } as any,
        })
    }

    /**
     * Promouvoir un utilisateur en admin
     */
    static async promoteToAdmin(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { role: 'ADMIN' },
        })
    }

    /**
     * Rétrograder un admin en utilisateur
     */
    static async demoteToUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { role: 'USER' },
        })
    }

    /**
     * Supprimer un utilisateur et toutes ses données
     */
    static async deleteUser(userId: string) {
        return prisma.user.delete({
            where: { id: userId },
        })
    }

    // ============================================
    // GESTION DES ANNONCES
    // ============================================

    /**
     * Récupérer la liste des annonces avec pagination et filtres
     */
    static async getAds({
        page = 1,
        limit = 20,
        search = '',
        status = '',
        moderationStatus = '',
        categoryId = '',
    }: {
        page?: number
        limit?: number
        search?: string
        status?: string
        moderationStatus?: string
        categoryId?: string
    }) {
        const skip = (page - 1) * limit

        const where: any = {}

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (status) {
            where.status = status
        }

        if (moderationStatus) {
            where.moderationStatus = moderationStatus;
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        const [ads, total] = await Promise.all([
            prisma.ad.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    status: true,
                    moderationStatus: true,
                    rejectionReason: true,
                    location: true,
                    views: true,
                    images: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            verificationStatus: true,
                        },
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                    _count: {
                        select: { reports: true },
                    },
                } as any,
            }),
            prisma.ad.count({ where }),
        ])

        return {
            ads: serializeDates(ads),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Changer le statut de disponibilité d'une annonce (active, sold, archived)
     */
    static async updateAdStatus(adId: string, status: string) {
        return prisma.ad.update({
            where: { id: adId },
            data: { status },
        })
    }

    /**
     * Approuver une annonce (Modération)
     */
    static async approveAd(adId: string) {
        // Validation : Vérifier que l'utilisateur est vérifié ou trusted
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            include: {
                user: true
            }
        });

        if (!ad) throw new Error("Annonce introuvable");

        const user = ad.user as any; // Cast pour accès aux champs récents
        if (user.verificationStatus !== 'VERIFIED' && user.verificationStatus !== 'TRUSTED') {
            throw new Error("Le compte de l'utilisateur n'est pas vérifié. Veuillez d'abord valider l'utilisateur.");
        }

        return prisma.ad.update({
            where: { id: adId },
            data: {
                moderationStatus: 'APPROVED',
                rejectionReason: null
            } as any,
        })
    }

    /**
     * Rejeter une annonce (Modération)
     */
    static async rejectAd(adId: string, reason: string) {
        return prisma.ad.update({
            where: { id: adId },
            data: {
                moderationStatus: 'REJECTED',
                rejectionReason: reason
            } as any,
        })
    }

    /**
     * Supprimer une annonce
     */
    static async deleteAd(adId: string) {
        return prisma.ad.delete({
            where: { id: adId },
        })
    }

    // ============================================
    // GESTION DES SIGNALEMENTS
    // ============================================

    /**
     * Récupérer la liste des signalements
     */
    static async getReports({
        page = 1,
        limit = 20,
        status = '',
    }: {
        page?: number
        limit?: number
        status?: string
    }) {
        const skip = (page - 1) * limit

        const where: any = {}

        if (status && (status === 'PENDING' || status === 'RESOLVED' || status === 'REJECTED')) {
            where.status = status
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    ad: {
                        select: {
                            id: true,
                            title: true,
                            images: true,
                        },
                    },
                } as any,
            }),
            prisma.report.count({ where }),
        ])

        return {
            reports: serializeDates(reports),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Résoudre un signalement
     */
    static async resolveReport(reportId: string) {
        return prisma.report.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' },
        })
    }

    /**
     * Rejeter un signalement
     */
    static async rejectReport(reportId: string) {
        return prisma.report.update({
            where: { id: reportId },
            data: { status: 'REJECTED' },
        })
    }

    // ============================================
    // GESTION DES CATÉGORIES
    // ============================================

    /**
     * Récupérer toutes les catégories avec leur structure arborescente
     */
    static async getCategories() {
        const categories = await prisma.category.findMany({
            where: { parentId: null },
            orderBy: { order: 'asc' },
            include: {
                children: {
                    orderBy: { order: 'asc' },
                    include: {
                        children: {
                            orderBy: { order: 'asc' },
                        },
                        _count: {
                            select: { ads: true },
                        },
                    },

                },
                _count: {
                    select: { ads: true },
                },
            },
        });
        return serializeDates(categories);
    }

    /**
     * Récupérer une catégorie par ID avec détails
     */
    static async getCategory(id: string) {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    orderBy: { order: 'asc' },
                    include: {
                        _count: { select: { ads: true } },
                        children: {
                            include: {
                                _count: { select: { ads: true } } // Include counts for grandchildren
                            }
                        },
                    },
                },
                _count: { select: { ads: true } },
            },
        });

        if (!category) return null;

        // Calculate recursive total ads
        const calculateTotalAds = (cat: any): number => {
            let total = cat._count.ads;
            if (cat.children) {
                total += cat.children.reduce((acc: number, child: any) => acc + calculateTotalAds(child), 0);
            }
            return total;
        };

        return {
            ...category,
            totalAds: calculateTotalAds(category)
        };
    }

    /**
     * Créer une nouvelle catégorie
     */
    static async createCategory(data: {
        name: string
        slug: string
        icon?: string
        description?: string
        parentId?: string
        order?: number
    }) {
        // Vérifier si une catégorie avec ce slug existe déjà
        const existing = await prisma.category.findFirst({
            where: { slug: data.slug }
        });

        if (existing) {
            throw new Error('Une catégorie avec ce slug existe déjà');
        }

        return prisma.category.create({
            data,
        })
    }

    /**
     * Mettre à jour une catégorie
     */
    static async updateCategory(
        categoryId: string,
        data: Partial<{
            name: string
            slug: string
            icon: string | null
            description: string | null
            parentId: string | null
            order: number
        }>
    ) {
        // Empêcher une catégorie d'être son propre parent (boucle)
        if (data.parentId && data.parentId === categoryId) {
            throw new Error('Une catégorie ne peut pas être son propre parent');
        }

        // Vérifier que le parentId existe (si fourni et non vide)
        if (data.parentId && data.parentId.trim() !== '') {
            const parentExists = await prisma.category.findUnique({
                where: { id: data.parentId }
            });
            if (!parentExists) {
                throw new Error('La catégorie parente sélectionnée n\'existe pas');
            }
        }

        // Vérifier si une autre catégorie avec ce slug existe déjà
        if (data.slug) {
            const existing = await prisma.category.findFirst({
                where: {
                    slug: data.slug,
                    id: { not: categoryId } // Exclure la catégorie en cours de modification
                }
            });

            if (existing) {
                throw new Error('Une catégorie avec ce slug existe déjà');
            }
        }

        // Nettoyer parentId si vide (pour enlever le parent)
        const cleanData = { ...data };
        if (cleanData.parentId === '' || cleanData.parentId === undefined) {
            cleanData.parentId = null;
        }

        return prisma.category.update({
            where: { id: categoryId },
            data: cleanData,
        })
    }

    /**
     * Récupérer le nombre total d'annonces dans une catégorie
     */
    static async getCategoryAdsInfo(categoryId: string) {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                children: {
                    include: {
                        _count: { select: { ads: true } }
                    }
                },
                _count: { select: { ads: true } }
            }
        });

        if (!category) {
            return null;
        }

        // Calculer le total des annonces (catégorie + sous-catégories)
        const directAds = (category as any)._count?.ads || 0;
        let childrenAds = 0;
        for (const child of category.children || []) {
            childrenAds += (child as any)._count?.ads || 0;
        }

        return {
            name: category.name,
            childrenCount: category.children?.length || 0,
            directAds,
            childrenAds,
            totalAds: directAds + childrenAds
        };
    }

    /**
     * Supprimer une catégorie avec toutes ses annonces (suppression forcée)
     */
    static async deleteCategoryWithAds(categoryId: string) {
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                children: true
            }
        });

        if (!category) {
            throw new Error('Catégorie introuvable');
        }

        // Vérifier s'il y a des sous-catégories (on ne peut pas supprimer récursivement)
        if (category.children && category.children.length > 0) {
            throw new Error(`Impossible de supprimer: cette catégorie contient ${category.children.length} sous-catégorie(s). Supprimez d'abord les sous-catégories.`);
        }

        // Supprimer les annonces de cette catégorie
        const deletedAds = await prisma.ad.deleteMany({
            where: { categoryId }
        });

        // Supprimer la catégorie
        await prisma.category.delete({
            where: { id: categoryId }
        });

        return {
            deletedAdsCount: deletedAds.count,
            message: `Catégorie supprimée avec ${deletedAds.count} annonce(s)`
        };
    }

    /**
     * Supprimer une catégorie (sans annonces)
     */
    static async deleteCategory(categoryId: string) {
        // Récupérer la catégorie avec ses enfants
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                children: {
                    include: {
                        children: true, // Sous-sous-catégories
                        _count: { select: { ads: true } }
                    },

                },
                _count: { select: { ads: true } }
            }
        });

        if (!category) {
            throw new Error('Catégorie introuvable');
        }

        // Vérifier s'il y a des sous-catégories
        const childrenCount = category.children?.length || 0;
        if (childrenCount > 0) {
            throw new Error(`Impossible de supprimer: cette catégorie contient ${childrenCount} sous-catégorie(s). Supprimez d'abord les sous-catégories.`);
        }

        // Vérifier s'il y a des annonces dans cette catégorie
        const adsCount = (category as any)._count?.ads || 0;
        if (adsCount > 0) {
            // Retourner un objet spécial pour indiquer qu'il y a des annonces
            return {
                hasAds: true,
                adsCount,
                categoryName: category.name,
                message: `Cette catégorie contient ${adsCount} annonce(s). Voulez-vous les supprimer définitivement ?`
            };
        }

        await prisma.category.delete({
            where: { id: categoryId },
        });

        return { success: true, message: 'Catégorie supprimée' };
    }
}
