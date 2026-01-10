import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/services';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

// GET /api/user/stats - Récupérer les statistiques du dashboard de l'utilisateur
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const stats = await UserService.getUserStats(session.user.id);

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        logServerError(error, { route: '/api/user/stats', action: 'get_user_stats' });
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.GENERIC
            },
            { status: 500 }
        );
    }
}


