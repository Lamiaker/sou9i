/**
 * API Route: Admin Reports Management
 * 
 * Utilise le système d'authentification admin séparé (NON NextAuth).
 * Toutes les actions sont protégées par des permissions granulaires.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateReportPages, revalidateAdsPages, revalidateUserPages } from '@/lib/cache-utils';
import { requireAdmin, getRequestContext } from '@/lib/admin-guard';
import { getAdminSession, logAdminAudit } from '@/lib/admin-auth';
import { AdminService } from '@/services';
import { AdminPermission } from '@prisma/client';

/**
 * POST - Actions sur les signalements
 */
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
        const { action, reportId, reason } = body;

        if (!reportId) {
            return NextResponse.json(
                { error: 'ID signalement requis' },
                { status: 400 }
            );
        }

        // Déterminer les permissions requises selon l'action
        let requiredPermissions: AdminPermission[] = [AdminPermission.REPORTS_READ];

        switch (action) {
            case 'resolve':
            case 'reject':
                requiredPermissions = [AdminPermission.REPORTS_RESOLVE];
                break;
            case 'delete_ad':
            case 'reject_ad':
                requiredPermissions = [AdminPermission.REPORTS_RESOLVE, AdminPermission.ADS_DELETE];
                break;
            case 'ban_user':
                requiredPermissions = [AdminPermission.REPORTS_RESOLVE, AdminPermission.USERS_BAN];
                break;
            case 'delete_ad_ban_user':
                requiredPermissions = [AdminPermission.REPORTS_RESOLVE, AdminPermission.ADS_DELETE, AdminPermission.USERS_BAN];
                break;
        }

        // Vérifier les permissions (super admin a tout)
        const hasPermission = session.admin.isSuperAdmin ||
            requiredPermissions.every(p => session.admin.permissions.includes(p));

        if (!hasPermission) {
            return NextResponse.json(
                { error: 'Permission insuffisante pour cette action', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }

        // Récupérer contexte pour l'audit
        const { ipAddress, userAgent } = getRequestContext(request);

        let result;
        let auditAction: string;

        switch (action) {
            case 'resolve':
                await AdminService.resolveReport(reportId);
                auditAction = 'REPORT_RESOLVED';
                result = { success: true, message: 'Signalement marqué comme résolu' };
                break;

            case 'reject':
                await AdminService.rejectReport(reportId);
                auditAction = 'REPORT_REJECTED';
                result = { success: true, message: 'Signalement rejeté (faux positif)' };
                break;

            case 'delete_ad':
                result = await AdminService.resolveReportDeleteAd(reportId);
                auditAction = 'REPORT_RESOLVED_AD_DELETED';
                break;

            case 'reject_ad':
                result = await AdminService.resolveReportRejectAd(
                    reportId,
                    reason || 'Contenu signalé par la communauté'
                );
                auditAction = 'REPORT_RESOLVED_AD_REJECTED';
                break;

            case 'ban_user':
                result = await AdminService.resolveReportBanUser(
                    reportId,
                    reason || 'Compte signalé par la communauté'
                );
                auditAction = 'REPORT_RESOLVED_USER_BANNED';
                break;

            case 'delete_ad_ban_user':
                result = await AdminService.resolveReportDeleteAdAndBanUser(
                    reportId,
                    reason || 'Annonce frauduleuse'
                );
                auditAction = 'REPORT_RESOLVED_AD_DELETED_USER_BANNED';
                break;

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }

        // Logger l'action
        await logAdminAudit({
            adminId: session.admin.id,
            action: auditAction,
            targetType: 'Report',
            targetId: reportId,
            details: { reason },
            ipAddress,
            userAgent,
        });

        revalidateReportPages();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Admin reports API error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * GET - Récupérer un signalement spécifique par ID
 */
export async function GET(request: NextRequest) {
    try {
        // ✅ Nouvelle vérification avec système admin séparé
        const authResult = await requireAdmin(request, {
            permissions: [AdminPermission.REPORTS_READ],
        });

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json(
                { error: 'ID signalement requis' },
                { status: 400 }
            );
        }

        const report = await AdminService.getReportById(reportId);

        if (!report) {
            return NextResponse.json(
                { error: 'Signalement introuvable' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: report });
    } catch (error) {
        console.error('Admin reports GET error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}


