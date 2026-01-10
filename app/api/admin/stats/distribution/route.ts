import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request);
        if (authResult instanceof NextResponse) return authResult;

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


