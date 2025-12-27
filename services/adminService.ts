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
}
