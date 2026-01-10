import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric') as 'users' | 'ads' | 'reports' | 'messages' | 'favorites';
        const days = parseInt(searchParams.get('days') || '30', 10);

        const validMetrics = ['users', 'ads', 'reports', 'messages', 'favorites'];
        if (!metric || !validMetrics.includes(metric)) {
            return NextResponse.json(
                { error: 'Paramètre metric invalide. Valeurs acceptées: users, ads, reports, messages, favorites' },
                { status: 400 }
            );
        }

        const validDays = [7, 30, 90];
        const safeDays = validDays.includes(days) ? days : 30;

        const timeline = await AdminService.getStatsTimeline(metric, safeDays);

        return NextResponse.json({
            success: true,
            data: {
                metric,
                days: safeDays,
                timeline,
            },
        });
    } catch (error) {
        console.error('Admin stats timeline API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


