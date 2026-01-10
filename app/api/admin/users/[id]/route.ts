import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/prisma';
import { AdminPermission } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAdmin(request, {
            permissions: [AdminPermission.USERS_READ],
        });
        if (authResult instanceof NextResponse) return authResult;

        const { id: userId } = await params;

        if (!userId) {
            return NextResponse.json(
                { error: 'ID utilisateur requis' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                city: true,
                role: true,
                verificationStatus: true,
                isTrusted: true,
                rejectionReason: true,
                isBanned: true,
                banReason: true,
                bannedAt: true,
                createdAt: true,
                updatedAt: true,
                ads: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        status: true,
                        moderationStatus: true,
                        rejectionReason: true,
                        location: true,
                        images: true,
                        views: true,
                        createdAt: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                reportsSent: {
                    select: {
                        id: true,
                        reason: true,
                        details: true,
                        status: true,
                        createdAt: true,
                        ad: {
                            select: {
                                id: true,
                                title: true,
                            }
                        },
                        reportedUser: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                reportsReceived: {
                    select: {
                        id: true,
                        reason: true,
                        details: true,
                        status: true,
                        createdAt: true,
                        ad: {
                            select: {
                                id: true,
                                title: true,
                            }
                        },
                        reporter: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                favorites: {
                    select: {
                        id: true,
                        createdAt: true,
                        ad: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                                images: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                receivedReviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                sentReviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        receiver: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        conversations: true,
                        messages: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        const stats = {
            totalAds: user.ads.length,
            activeAds: user.ads.filter(ad => ad.status === 'active' && ad.moderationStatus === 'APPROVED').length,
            pendingAds: user.ads.filter(ad => ad.moderationStatus === 'PENDING').length,
            rejectedAds: user.ads.filter(ad => ad.moderationStatus === 'REJECTED').length,
            totalViews: user.ads.reduce((sum, ad) => sum + ad.views, 0),
            totalReportsSent: user.reportsSent.length,
            totalReportsReceived: user.reportsReceived.length,
            pendingReportsReceived: user.reportsReceived.filter(r => r.status === 'PENDING').length,
            averageRating: user.receivedReviews.length > 0
                ? (user.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / user.receivedReviews.length).toFixed(1)
                : null,
            totalReviewsReceived: user.receivedReviews.length,
        };

        return NextResponse.json({
            user,
            stats
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
