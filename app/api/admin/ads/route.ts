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
        const { action, adId, status } = body;

        if (!adId) {
            return NextResponse.json(
                { error: 'ID annonce requis' },
                { status: 400 }
            );
        }

        switch (action) {
            case 'updateStatus': // Statut de disponibilité (active, sold, etc.)
                if (!status) {
                    return NextResponse.json(
                        { error: 'Statut requis' },
                        { status: 400 }
                    );
                }
                await AdminService.updateAdStatus(adId, status);
                return NextResponse.json({ success: true, message: 'Statut mis à jour' });

            case 'approve': // Modération: Approuver
                await AdminService.approveAd(adId);
                return NextResponse.json({ success: true, message: 'Annonce approuvée' });

            case 'reject': // Modération: Rejeter
                const { reason } = body;
                if (!reason) {
                    return NextResponse.json(
                        { error: 'Raison du rejet requise' },
                        { status: 400 }
                    );
                }
                await AdminService.rejectAd(adId, reason);
                return NextResponse.json({ success: true, message: 'Annonce rejetée' });

            case 'delete':
                await AdminService.deleteAd(adId);
                return NextResponse.json({ success: true, message: 'Annonce supprimée' });

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Admin ads API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
