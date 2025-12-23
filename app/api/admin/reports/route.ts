import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';
import { revalidatePath } from 'next/cache';

/**
 * Revalider toutes les pages affectées par les actions sur les signalements
 */
function revalidateReportPages() {
    // Pages admin
    revalidatePath('/admin/reports');
    revalidatePath('/admin/reports/resolved');
    revalidatePath('/admin/reports/rejected');
    revalidatePath('/admin/reports/all');
    revalidatePath('/admin/ads');
    revalidatePath('/admin/users');
    revalidatePath('/admin');

    // Pages publiques du site (affectées si annonce supprimée/masquée ou utilisateur banni)
    revalidatePath('/');                    // Page d'accueil
    revalidatePath('/search');              // Recherche
    revalidatePath('/categories', 'layout'); // Toutes les pages de catégories
    revalidatePath('/annonces', 'layout');   // Toutes les pages d'annonces
}

/**
 * API Route pour la gestion des signalements par l'admin
 * 
 * Actions disponibles:
 * - resolve: Marquer comme résolu (sans action)
 * - reject: Rejeter le signalement (faux positif)
 * - delete_ad: Supprimer l'annonce signalée
 * - reject_ad: Rejeter l'annonce (la rendre invisible)
 * - ban_user: Bannir l'utilisateur signalé
 * - delete_ad_ban_user: Supprimer l'annonce ET bannir l'utilisateur
 */
export async function POST(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est admin
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
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

        let result;

        switch (action) {
            // ============================================
            // ACTIONS SIMPLES
            // ============================================

            case 'resolve':
                // Marquer comme résolu sans action particulière
                await AdminService.resolveReport(reportId);
                revalidateReportPages();
                return NextResponse.json({
                    success: true,
                    message: 'Signalement marqué comme résolu'
                });

            case 'reject':
                // Rejeter le signalement (faux positif)
                await AdminService.rejectReport(reportId);
                revalidateReportPages();
                return NextResponse.json({
                    success: true,
                    message: 'Signalement rejeté (faux positif)'
                });

            // ============================================
            // ACTIONS SUR L'ANNONCE
            // ============================================

            case 'delete_ad':
                // Supprimer l'annonce signalée
                result = await AdminService.resolveReportDeleteAd(reportId);
                revalidateReportPages();
                return NextResponse.json(result);

            case 'reject_ad':
                // Rejeter l'annonce (la rendre invisible mais pas supprimée)
                result = await AdminService.resolveReportRejectAd(
                    reportId,
                    reason || 'Contenu signalé par la communauté'
                );
                revalidateReportPages();
                return NextResponse.json(result);

            // ============================================
            // ACTIONS SUR L'UTILISATEUR
            // ============================================

            case 'ban_user':
                // Bannir l'utilisateur signalé
                result = await AdminService.resolveReportBanUser(
                    reportId,
                    reason || 'Compte signalé par la communauté'
                );
                revalidateReportPages();
                return NextResponse.json(result);

            case 'delete_ad_ban_user':
                // Supprimer l'annonce ET bannir l'utilisateur (cas grave)
                result = await AdminService.resolveReportDeleteAdAndBanUser(
                    reportId,
                    reason || 'Annonce frauduleuse'
                );
                revalidateReportPages();
                return NextResponse.json(result);

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }
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
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
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
