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
        const { action, userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'ID utilisateur requis' },
                { status: 400 }
            );
        }

        // Empêcher l'admin de se modifier lui-même pour certaines actions
        if (userId === session.user.id && ['delete', 'demote'].includes(action)) {
            return NextResponse.json(
                { error: 'Vous ne pouvez pas effectuer cette action sur votre propre compte' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'verify':
                // Peut être trusted ou regular verified
                const { trusted } = body;
                await AdminService.verifyUser(userId, trusted === true);
                return NextResponse.json({ success: true, message: trusted ? 'Utilisateur marqué comme de confiance' : 'Utilisateur vérifié' });

            case 'unverify':
                await AdminService.unverifyUser(userId);
                return NextResponse.json({ success: true, message: 'Vérification retirée' });

            case 'reject':
                const { reason } = body;
                if (!reason) {
                    return NextResponse.json({ error: 'Motif requis pour le rejet' }, { status: 400 });
                }
                await AdminService.rejectUser(userId, reason);
                return NextResponse.json({ success: true, message: 'Utilisateur rejeté' });

            case 'promote':
                await AdminService.promoteToAdmin(userId);
                return NextResponse.json({ success: true, message: 'Utilisateur promu admin' });

            case 'demote':
                await AdminService.demoteToUser(userId);
                return NextResponse.json({ success: true, message: 'Admin rétrogradé en utilisateur' });

            case 'delete':
                await AdminService.deleteUser(userId);
                return NextResponse.json({ success: true, message: 'Utilisateur supprimé' });

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Admin users API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
