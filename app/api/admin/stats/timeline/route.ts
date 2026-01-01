import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';

/**
 * GET /api/admin/stats/timeline?metric=users&days=30
 * Récupère les données temporelles pour les graphiques
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric') as 'users' | 'ads' | 'reports' | 'messages' | 'favorites';
        const days = parseInt(searchParams.get('days') || '30', 10);

        // Validation des paramètres
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
