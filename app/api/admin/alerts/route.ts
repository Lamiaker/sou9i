import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';
import { evaluateAlerts, ALERT_THRESHOLDS } from '@/lib/admin-alerts';

/**
 * GET /api/admin/alerts
 * Récupère les alertes actives basées sur les stats actuelles
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        // Récupérer les stats enrichies
        const stats = await AdminService.getEnhancedDashboardStats();

        // Évaluer les alertes
        const alerts = evaluateAlerts(stats);

        return NextResponse.json({
            success: true,
            data: {
                alerts,
                thresholds: ALERT_THRESHOLDS,
                summary: {
                    total: alerts.length,
                    danger: alerts.filter(a => a.type === 'danger').length,
                    warning: alerts.filter(a => a.type === 'warning').length,
                    info: alerts.filter(a => a.type === 'info').length,
                },
            },
        });
    } catch (error) {
        console.error('Admin alerts API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
