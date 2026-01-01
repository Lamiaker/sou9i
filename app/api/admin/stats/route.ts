import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';

/**
 * GET /api/admin/stats
 * Récupère les statistiques enrichies du dashboard admin
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const stats = await AdminService.getEnhancedDashboardStats();

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Admin stats API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
