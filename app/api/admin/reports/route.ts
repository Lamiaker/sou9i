import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminService } from '@/services';

export async function POST(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est admin
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { action, reportId } = body;

        if (!reportId) {
            return NextResponse.json(
                { error: 'ID signalement requis' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'resolve':
                await AdminService.resolveReport(reportId);
                return NextResponse.json({ success: true, message: 'Signalement résolu' });

            case 'reject':
                await AdminService.rejectReport(reportId);
                return NextResponse.json({ success: true, message: 'Signalement rejeté' });

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Admin reports API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
