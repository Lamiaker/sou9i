import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

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

/**
 * Supprimer les fichiers images d'une annonce du système de fichiers
 * @param imageUrls - Array des URLs des images (ex: /uploads/ads/123-abc.jpg)
 */
async function deleteAdImages(imageUrls: string[]): Promise<void> {
    if (!imageUrls || imageUrls.length === 0) return;

    for (const imageUrl of imageUrls) {
        try {
            // Convertir l'URL en chemin de fichier
            // /uploads/ads/123-abc.jpg -> public/uploads/ads/123-abc.jpg
            if (imageUrl.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), 'public', imageUrl);

                // Vérifier si le fichier existe avant de supprimer
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`Image supprimée: ${filePath}`);
                }
            }
        } catch (error) {
            // Log l'erreur mais ne pas bloquer la suppression de l'annonce
            console.error(`Erreur lors de la suppression de l'image ${imageUrl}:`, error);
        }
    }
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
            prisma.category.count({ where: { parentId: null } }),
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
     * Supprimer une annonce et ses images associées
     */
    static async deleteAd(adId: string) {
        // Récupérer l'annonce avec ses images avant suppression
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            select: { images: true }
        });

        // Supprimer les fichiers images du système de fichiers
        if (ad?.images) {
            await deleteAdImages(ad.images);
        }

        // Supprimer l'annonce de la base de données
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
     * Récupérer un signalement par ID avec tous les détails
     */
    static async getReportById(reportId: string) {
        return prisma.report.findUnique({
            where: { id: reportId },
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
                        isBanned: true,
                    },
                },
                ad: {
                    select: {
                        id: true,
                        title: true,
                        images: true,
                        userId: true,
                        status: true,
                        moderationStatus: true,
                    },
                },
            },
        })
    }

    /**
     * Résoudre un signalement (marquer comme résolu sans action)
     */
    static async resolveReport(reportId: string) {
        return prisma.report.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' },
        })
    }

    /**
     * Rejeter un signalement (faux signalement, pas d'action)
     */
    static async rejectReport(reportId: string) {
        return prisma.report.update({
            where: { id: reportId },
            data: { status: 'REJECTED' },
        })
    }

    /**
     * Résoudre un signalement d'annonce en supprimant l'annonce et ses images
     */
    static async resolveReportDeleteAd(reportId: string) {
        const report = await this.getReportById(reportId)

        if (!report) {
            throw new Error('Signalement introuvable')
        }

        if (!report.adId) {
            throw new Error('Ce signalement ne concerne pas une annonce')
        }

        // Récupérer l'annonce avec ses images avant suppression
        const ad = await prisma.ad.findUnique({
            where: { id: report.adId },
            select: { images: true }
        });

        // Supprimer les fichiers images du système de fichiers
        if (ad?.images) {
            await deleteAdImages(ad.images);
        }

        // Supprimer l'annonce
        await prisma.ad.delete({
            where: { id: report.adId },
        })

        // Marquer tous les signalements liés à cette annonce comme résolus
        await prisma.report.updateMany({
            where: { adId: report.adId },
            data: { status: 'RESOLVED' },
        })

        return { success: true, message: 'Annonce supprimée et signalement résolu' }
    }

    /**
     * Résoudre un signalement d'annonce en rejetant l'annonce (la rend invisible)
     */
    static async resolveReportRejectAd(reportId: string, reason: string) {
        const report = await this.getReportById(reportId)

        if (!report) {
            throw new Error('Signalement introuvable')
        }

        if (!report.adId) {
            throw new Error('Ce signalement ne concerne pas une annonce')
        }

        // Rejeter l'annonce
        await prisma.ad.update({
            where: { id: report.adId },
            data: {
                moderationStatus: 'REJECTED',
                rejectionReason: reason || 'Contenu signalé par la communauté'
            } as any,
        })

        // Marquer le signalement comme résolu
        await prisma.report.update({
            where: { id: reportId },
            data: { status: 'RESOLVED' },
        })

        return { success: true, message: 'Annonce rejetée et signalement résolu' }
    }

    /**
     * Résoudre un signalement en bannissant l'utilisateur signalé
     */
    static async resolveReportBanUser(reportId: string, banReason: string) {
        const report = await this.getReportById(reportId)

        if (!report) {
            throw new Error('Signalement introuvable')
        }

        // Déterminer l'utilisateur à bannir
        let userIdToBan = report.reportedUserId

        // Si c'est un signalement d'annonce, bannir le propriétaire de l'annonce
        if (!userIdToBan && report.ad) {
            userIdToBan = report.ad.userId
        }

        if (!userIdToBan) {
            throw new Error('Aucun utilisateur à bannir pour ce signalement')
        }

        // Bannir l'utilisateur
        await prisma.user.update({
            where: { id: userIdToBan },
            data: {
                isBanned: true,
                banReason: banReason || 'Compte signalé par la communauté',
                bannedAt: new Date(),
            },
        })

        // Rejeter les annonces APPROVED ou PENDING de cet utilisateur (pas celles déjà REJECTED)
        await prisma.ad.updateMany({
            where: {
                userId: userIdToBan,
                moderationStatus: { in: ['APPROVED', 'PENDING'] }
            },
            data: {
                moderationStatus: 'REJECTED',
                rejectionReason: 'Compte banni: ' + (banReason || 'Compte signalé')
            } as any,
        })

        // Marquer tous les signalements liés à cet utilisateur comme résolus
        await prisma.report.updateMany({
            where: {
                OR: [
                    { reportedUserId: userIdToBan },
                    { ad: { userId: userIdToBan } }
                ]
            },
            data: { status: 'RESOLVED' },
        })

        return { success: true, message: 'Utilisateur banni et signalement résolu' }
    }

    /**
     * Résoudre un signalement en supprimant l'annonce, ses images ET bannissant l'utilisateur
     */
    static async resolveReportDeleteAdAndBanUser(reportId: string, banReason: string) {
        const report = await this.getReportById(reportId)

        if (!report) {
            throw new Error('Signalement introuvable')
        }

        if (!report.adId) {
            throw new Error('Ce signalement ne concerne pas une annonce')
        }

        // Récupérer l'annonce avec toutes ses images
        const ad = await prisma.ad.findUnique({
            where: { id: report.adId },
            select: {
                images: true,
                userId: true
            }
        });

        if (!ad) {
            throw new Error('Annonce introuvable')
        }

        // Supprimer les fichiers images du système de fichiers
        if (ad.images) {
            await deleteAdImages(ad.images);
        }

        // Supprimer l'annonce
        await prisma.ad.delete({
            where: { id: report.adId },
        })

        // Bannir l'utilisateur
        await prisma.user.update({
            where: { id: ad.userId },
            data: {
                isBanned: true,
                banReason: banReason || 'Annonce frauduleuse',
                bannedAt: new Date(),
            },
        })

        // Rejeter les annonces APPROVED ou PENDING (pas celles déjà REJECTED)
        await prisma.ad.updateMany({
            where: {
                userId: ad.userId,
                moderationStatus: { in: ['APPROVED', 'PENDING'] }
            },
            data: {
                moderationStatus: 'REJECTED',
                rejectionReason: 'Compte banni: ' + (banReason || 'Annonce frauduleuse')
            } as any,
        })

        // Marquer tous les signalements liés comme résolus
        await prisma.report.updateMany({
            where: {
                OR: [
                    { reportedUserId: ad.userId },
                    { ad: { userId: ad.userId } }
                ]
            },
            data: { status: 'RESOLVED' },
        })

        return { success: true, message: 'Annonce supprimée, utilisateur banni et signalement résolu' }
    }

    /**
     * Compter les signalements en attente
     */
    static async getPendingReportsCount() {
        return prisma.report.count({
            where: { status: 'PENDING' }
        })
    }

    /**
     * Compter les signalements contre un utilisateur
     */
    static async getReportsCountForUser(userId: string) {
        return prisma.report.count({
            where: {
                OR: [
                    { reportedUserId: userId },
                    { ad: { userId: userId } }
                ],
                status: 'PENDING'
            }
        })
    }

    // ============================================
    // GESTION DES CATÉGORIES
    // ============================================

    /**
     * Récupérer toutes les catégories avec leur structure arborescente (avec pagination)
     */
    static async getCategories({
        page = 1,
        limit = 20,
        search = '',
    }: {
        page?: number
        limit?: number
        search?: string
    } = {}) {
        const skip = (page - 1) * limit;

        const where: any = { parentId: null };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { order: 'asc' },
                include: {
                    children: {
                        orderBy: { order: 'asc' },
                        include: {
                            children: {
                                orderBy: { order: 'asc' },
                                include: {
                                    _count: {
                                        select: { ads: true },
                                    },
                                },
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
            }),
            prisma.category.count({ where }),
        ]);

        return {
            categories: serializeDates(categories),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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
        image?: string
        description?: string
        parentId?: string
        order?: number
        isTrending?: boolean
        trendingOrder?: number | null
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
            image: string | null
            description: string | null
            parentId: string | null
            order: number
            isTrending: boolean
            trendingOrder: number | null
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
     * Supprimer une catégorie avec toutes ses annonces et images (suppression forcée)
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

        // Récupérer toutes les annonces avec leurs images avant suppression
        const ads = await prisma.ad.findMany({
            where: { categoryId },
            select: { images: true }
        });

        // Supprimer les fichiers images de toutes les annonces
        for (const ad of ads) {
            if (ad.images) {
                await deleteAdImages(ad.images);
            }
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

    // ============================================
    // STATISTIQUES AVANCÉES DU DASHBOARD
    // ============================================

    /**
     * Statistiques enrichies avec tendances et comparaisons
     */
    static async getEnhancedDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const [
            // Utilisateurs
            totalUsers,
            newUsersThisMonth,
            newUsersLastMonth,
            newUsersLast7Days,
            newUsersPrev7Days,
            verifiedUsers,
            trustedUsers,
            pendingUsers,
            bannedUsers,

            // Annonces
            totalAds,
            activeAds,
            pendingAds,
            approvedAds,
            rejectedAds,
            newAdsThisMonth,
            newAdsLastMonth,
            totalViews,

            // Signalements & Support
            pendingReports,
            resolvedReportsThisMonth,
            openTickets,
            inProgressTickets,

            // Catégories
            totalCategories,
            trendingCategories,

            // Engagement
            totalFavorites,
            totalMessages,
            totalReviews,
            avgRating,
        ] = await Promise.all([
            // Utilisateurs
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
            prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
            prisma.user.count({ where: { verificationStatus: 'VERIFIED' } }),
            prisma.user.count({ where: { verificationStatus: 'TRUSTED' } }),
            prisma.user.count({ where: { verificationStatus: 'PENDING', role: 'USER' } }),
            prisma.user.count({ where: { isBanned: true } }),

            // Annonces
            prisma.ad.count(),
            prisma.ad.count({ where: { status: 'active', moderationStatus: 'APPROVED' } }),
            prisma.ad.count({ where: { moderationStatus: 'PENDING' } }),
            prisma.ad.count({ where: { moderationStatus: 'APPROVED' } }),
            prisma.ad.count({ where: { moderationStatus: 'REJECTED' } }),
            prisma.ad.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.ad.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
            prisma.ad.aggregate({ _sum: { views: true } }),

            // Signalements & Support
            prisma.report.count({ where: { status: 'PENDING' } }),
            prisma.report.count({ where: { status: 'RESOLVED', updatedAt: { gte: startOfMonth } } }),
            prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),

            // Catégories
            prisma.category.count({ where: { parentId: null } }),
            prisma.category.count({ where: { isTrending: true } }),

            // Engagement
            prisma.favorite.count(),
            prisma.message.count(),
            prisma.review.count(),
            prisma.review.aggregate({ _avg: { rating: true } }),
        ]);

        // Calcul des tendances (% évolution)
        const calcTrend = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return {
            users: {
                total: totalUsers,
                newThisMonth: newUsersThisMonth,
                newLast7Days: newUsersLast7Days,
                trend7Days: calcTrend(newUsersLast7Days, newUsersPrev7Days),
                trendMonth: calcTrend(newUsersThisMonth, newUsersLastMonth),
                byStatus: {
                    verified: verifiedUsers,
                    trusted: trustedUsers,
                    pending: pendingUsers,
                    banned: bannedUsers,
                },
                verificationRate: totalUsers > 0 ? Math.round(((verifiedUsers + trustedUsers) / totalUsers) * 100) : 0,
            },
            ads: {
                total: totalAds,
                active: activeAds,
                pending: pendingAds,
                approved: approvedAds,
                rejected: rejectedAds,
                newThisMonth: newAdsThisMonth,
                trendMonth: calcTrend(newAdsThisMonth, newAdsLastMonth),
                totalViews: totalViews._sum.views || 0,
                approvalRate: totalAds > 0 ? Math.round((approvedAds / totalAds) * 100) : 0,
            },
            moderation: {
                pendingReports: pendingReports,
                resolvedThisMonth: resolvedReportsThisMonth,
                openTickets: openTickets,
                inProgressTickets: inProgressTickets,
                totalTicketsPending: openTickets + inProgressTickets,
            },
            categories: {
                total: totalCategories,
                trending: trendingCategories,
            },
            engagement: {
                totalFavorites: totalFavorites,
                totalMessages: totalMessages,
                totalReviews: totalReviews,
                avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
            },
        };
    }

    /**
     * Données temporelles pour les graphiques (évolution sur période)
     * @param metric - Type de métrique (users, ads, reports, messages)
     * @param days - Nombre de jours à récupérer (7, 30, 90)
     */
    static async getStatsTimeline(metric: 'users' | 'ads' | 'reports' | 'messages' | 'favorites', days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        let data: any[] = [];

        switch (metric) {
            case 'users':
                data = await prisma.user.findMany({
                    where: { createdAt: { gte: startDate } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                break;
            case 'ads':
                data = await prisma.ad.findMany({
                    where: { createdAt: { gte: startDate } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                break;
            case 'reports':
                data = await prisma.report.findMany({
                    where: { createdAt: { gte: startDate } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                break;
            case 'messages':
                data = await prisma.message.findMany({
                    where: { createdAt: { gte: startDate } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                break;
            case 'favorites':
                data = await prisma.favorite.findMany({
                    where: { createdAt: { gte: startDate } },
                    select: { createdAt: true },
                    orderBy: { createdAt: 'asc' },
                });
                break;
        }

        // Agréger par jour
        const dailyCounts: { [key: string]: number } = {};

        // Initialiser tous les jours à 0
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            dailyCounts[dateKey] = 0;
        }

        // Compter les entrées par jour
        data.forEach((item) => {
            const dateKey = new Date(item.createdAt).toISOString().split('T')[0];
            if (dailyCounts[dateKey] !== undefined) {
                dailyCounts[dateKey]++;
            }
        });

        // Convertir en tableau ordonné
        return Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count,
            label: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        }));
    }

    /**
     * Distribution des utilisateurs par statut et ville
     */
    static async getUsersDistribution() {
        const [byStatus, byCity, topCreators] = await Promise.all([
            // Par statut de vérification
            prisma.user.groupBy({
                by: ['verificationStatus'],
                _count: { id: true },
                where: { role: 'USER' },
            }),

            // Par ville (top 10)
            prisma.user.groupBy({
                by: ['city'],
                _count: { id: true },
                where: { city: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),

            // Top créateurs d'annonces
            prisma.user.findMany({
                where: { role: 'USER' },
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                    verificationStatus: true,
                    _count: { select: { ads: true } },
                },
                orderBy: { ads: { _count: 'desc' } },
                take: 10,
            }),
        ]);

        // Compter les bannis séparément
        const bannedCount = await prisma.user.count({ where: { isBanned: true } });

        return {
            byStatus: byStatus.map((s) => ({
                status: s.verificationStatus,
                count: s._count.id,
            })),
            bannedCount,
            byCity: byCity.map((c) => ({
                city: c.city || 'Non renseigné',
                count: c._count.id,
            })),
            topCreators: topCreators.map((u) => ({
                id: u.id,
                name: u.name,
                avatar: u.avatar,
                verificationStatus: u.verificationStatus,
                adsCount: u._count.ads,
            })),
        };
    }

    /**
     * Distribution des annonces par catégorie et statut
     */
    static async getAdsDistribution() {
        const [byCategory, byStatus, byModeration, byLocation, topViewed, topFavorited] = await Promise.all([
            // Par catégorie parente (top 10)
            prisma.ad.groupBy({
                by: ['categoryId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 15,
            }),

            // Par statut (active, sold, archived)
            prisma.ad.groupBy({
                by: ['status'],
                _count: { id: true },
            }),

            // Par statut de modération
            prisma.ad.groupBy({
                by: ['moderationStatus'],
                _count: { id: true },
            }),

            // Par localisation (top 10)
            prisma.ad.groupBy({
                by: ['location'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 10,
            }),

            // Top annonces par vues
            prisma.ad.findMany({
                where: { moderationStatus: 'APPROVED' },
                select: {
                    id: true,
                    title: true,
                    views: true,
                    images: true,
                    category: { select: { name: true } },
                },
                orderBy: { views: 'desc' },
                take: 5,
            }),

            // Top annonces par favoris
            prisma.ad.findMany({
                where: { moderationStatus: 'APPROVED' },
                select: {
                    id: true,
                    title: true,
                    images: true,
                    _count: { select: { favorites: true } },
                    category: { select: { name: true } },
                },
                orderBy: { favorites: { _count: 'desc' } },
                take: 5,
            }),
        ]);

        // Récupérer les noms des catégories
        const categoryIds = byCategory.map((c) => c.categoryId);
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, parentId: true, parent: { select: { name: true } } },
        });

        const categoryMap = new Map(categories.map((c) => [c.id, c]));

        return {
            byCategory: byCategory.map((c) => {
                const cat = categoryMap.get(c.categoryId);
                return {
                    categoryId: c.categoryId,
                    categoryName: cat?.parent?.name || cat?.name || 'Inconnue',
                    subcategoryName: cat?.parent ? cat.name : null,
                    count: c._count.id,
                };
            }),
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
            byModeration: byModeration.map((m) => ({
                status: m.moderationStatus,
                count: m._count.id,
            })),
            byLocation: byLocation.map((l) => ({
                location: l.location,
                count: l._count.id,
            })),
            topViewed: serializeDates(topViewed.map((a) => ({
                id: a.id,
                title: a.title,
                views: a.views,
                image: a.images[0] || null,
                category: a.category.name,
            }))),
            topFavorited: serializeDates(topFavorited.map((a) => ({
                id: a.id,
                title: a.title,
                favoritesCount: a._count.favorites,
                image: a.images[0] || null,
                category: a.category.name,
            }))),
        };
    }

    /**
     * Distribution des signalements par raison et statut
     */
    static async getReportsDistribution() {
        const [byReason, byStatus] = await Promise.all([
            // Par raison de signalement
            prisma.report.groupBy({
                by: ['reason'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            // Par statut
            prisma.report.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        return {
            byReason: byReason.map((r) => ({
                reason: r.reason,
                count: r._count.id,
            })),
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
        };
    }

    /**
     * Distribution des tickets support par catégorie et statut
     */
    static async getSupportDistribution() {
        const [byCategory, byStatus] = await Promise.all([
            // Par catégorie de ticket
            prisma.supportTicket.groupBy({
                by: ['category'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),

            // Par statut
            prisma.supportTicket.groupBy({
                by: ['status'],
                _count: { id: true },
            }),
        ]);

        return {
            byCategory: byCategory.map((c) => ({
                category: c.category,
                count: c._count.id,
            })),
            byStatus: byStatus.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
        };
    }
}
