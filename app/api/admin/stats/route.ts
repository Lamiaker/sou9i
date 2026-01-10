import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

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


