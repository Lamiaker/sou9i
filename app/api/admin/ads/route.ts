
import { NextRequest, NextResponse } from 'next/server';
import { revalidateAdsPages } from '@/lib/cache-utils';
import { requireAdmin, getRequestContext } from '@/lib/admin-guard';
import { getAdminSession, logAdminAudit } from '@/lib/admin-auth';
import { AdminService } from '@/services';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';
import { sanitizePaginationParams } from '@/lib/utils/pagination';
import { PAGINATION } from '@/lib/constants/pagination';
import { AdminPermission } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        // ✅ Nouvelle vérification avec système admin séparé
        const authResult = await requireAdmin(request, {
            permissions: [AdminPermission.ADS_READ],
        });

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const searchParams = request.nextUrl.searchParams;
        const { page, limit } = sanitizePaginationParams(
            searchParams.get('page'),
            searchParams.get('limit'),
            { defaultLimit: PAGINATION.DEFAULT_LIMIT_ADMIN }
        );
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const moderationStatus = searchParams.get('moderationStatus') || '';

        const result = await AdminService.getAds({
            page,
            limit,
            search,
            status,
            moderationStatus
        });

        return NextResponse.json({
            success: true,
            data: result.ads,
            pagination: result.pagination
        });
    } catch (error) {
        logServerError(error, { route: '/api/admin/ads', action: 'get_ads' });
        return NextResponse.json({ error: ERROR_MESSAGES.GENERIC }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        // Récupérer la session admin
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Non autorisé', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, adId, status } = body;

        if (!adId) {
            return NextResponse.json(
                { error: 'ID annonce requis' },
                { status: 400 }
            );
        }

        // Déterminer les permissions requises selon l'action
        let requiredPermission: AdminPermission;
        switch (action) {
            case 'updateStatus':
            case 'approve':
            case 'reject':
                requiredPermission = AdminPermission.ADS_MODERATE;
                break;
            case 'delete':
                requiredPermission = AdminPermission.ADS_DELETE;
                break;
            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }

        // Vérifier la permission
        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(requiredPermission);

        if (!hasPermission) {
            return NextResponse.json(
                { error: 'Permission insuffisante pour cette action', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }

        // Récupérer contexte pour l'audit
        const { ipAddress, userAgent } = getRequestContext(request);

        switch (action) {
            case 'updateStatus':
                if (!status) {
                    return NextResponse.json(
                        { error: 'Statut requis' },
                        { status: 400 }
                    );
                }
                await AdminService.updateAdStatus(adId, status);
                revalidateAdsPages(adId);
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'AD_STATUS_UPDATED',
                    targetType: 'Ad',
                    targetId: adId,
                    details: { newStatus: status },
                    ipAddress,
                    userAgent,
                });
                return NextResponse.json({ success: true, message: 'Statut mis à jour' });

            case 'approve':
                await AdminService.approveAd(adId);
                revalidateAdsPages(adId);
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'AD_APPROVED',
                    targetType: 'Ad',
                    targetId: adId,
                    ipAddress,
                    userAgent,
                });
                return NextResponse.json({ success: true, message: 'Annonce approuvée' });

            case 'reject':
                const { reason } = body;
                if (!reason) {
                    return NextResponse.json(
                        { error: 'Raison du rejet requise' },
                        { status: 400 }
                    );
                }
                await AdminService.rejectAd(adId, reason);
                revalidateAdsPages(adId);
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'AD_REJECTED',
                    targetType: 'Ad',
                    targetId: adId,
                    details: { reason },
                    ipAddress,
                    userAgent,
                });
                return NextResponse.json({ success: true, message: 'Annonce rejetée' });

            case 'delete':
                await AdminService.deleteAd(adId);
                revalidateAdsPages(adId);
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'AD_DELETED',
                    targetType: 'Ad',
                    targetId: adId,
                    ipAddress,
                    userAgent,
                });
                return NextResponse.json({ success: true, message: 'Annonce supprimée' });

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }
    } catch (error) {
        logServerError(error, { route: '/api/admin/ads', action: 'manage_ad' });
        return NextResponse.json(
            { error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}


