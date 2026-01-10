import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';
import { evaluateAlerts, ALERT_THRESHOLDS } from '@/lib/admin-alerts';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const stats = await AdminService.getEnhancedDashboardStats();
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


