import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';

/**
 * GET /api/admin/stats/distribution?type=users|ads|reports|support
 * Récupère les distributions pour les graphiques (donut, bar charts)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'users' | 'ads' | 'reports' | 'support' | 'all';

        let data: any = {};

        switch (type) {
            case 'users':
                data = await AdminService.getUsersDistribution();
                break;
            case 'ads':
                data = await AdminService.getAdsDistribution();
                break;
            case 'reports':
                data = await AdminService.getReportsDistribution();
                break;
            case 'support':
                data = await AdminService.getSupportDistribution();
                break;
            case 'all':
                // Récupérer toutes les distributions en parallèle
                const [users, ads, reports, support] = await Promise.all([
                    AdminService.getUsersDistribution(),
                    AdminService.getAdsDistribution(),
                    AdminService.getReportsDistribution(),
                    AdminService.getSupportDistribution(),
                ]);
                data = { users, ads, reports, support };
                break;
            default:
                return NextResponse.json(
                    { error: 'Paramètre type invalide. Valeurs acceptées: users, ads, reports, support, all' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Admin stats distribution API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
