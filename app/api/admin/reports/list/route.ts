import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';
import { sanitizePaginationParams } from '@/lib/utils/pagination';
import { PAGINATION } from '@/lib/constants/pagination';
import { AdminPermission } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authResult = await requireAdmin(request, {
            permissions: [AdminPermission.REPORTS_READ],
        });
        if (authResult instanceof NextResponse) return authResult;

        const { searchParams } = new URL(request.url);
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


