import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';
import { sanitizePaginationParams } from '@/lib/utils/pagination';
import { PAGINATION } from '@/lib/constants/pagination';

/**
 * GET - Récupérer la liste des signalements avec filtres
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
        // ✅ Validation sécurisée des paramètres de pagination
        const { page, limit } = sanitizePaginationParams(
            searchParams.get('page'),
            searchParams.get('limit'),
            { defaultLimit: PAGINATION.DEFAULT_LIMIT_ADMIN }
        );
        const status = searchParams.get('status') || '';

        const { reports, pagination } = await AdminService.getReports({
            page,
            limit,
            status,
        });

        return NextResponse.json({
            success: true,
            reports,
            pagination,
        });
    } catch (error) {
        console.error('Admin reports list error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
