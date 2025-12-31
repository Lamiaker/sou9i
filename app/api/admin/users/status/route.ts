import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, action, reason } = body;

        if (!userId) {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
        }

        // Empêcher toute modification sur un compte ADMIN
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (targetUser?.role === 'ADMIN') {
            return NextResponse.json({ error: 'Impossible de modifier un compte administrateur' }, { status: 403 });
        }

        if (action === 'ban') {
            if (!reason) {
                return NextResponse.json({ error: 'Raison du blocage requise' }, { status: 400 });
            }

            // 1. Bannir l'utilisateur
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: true,
                    banReason: reason,
                    bannedAt: new Date(),
                },
            } as any);

            // 2. Masquer uniquement les annonces APPROVED ou PENDING (pas celles déjà REJECTED)
            await prisma.ad.updateMany({
                where: {
                    userId: userId,
                    moderationStatus: { in: ['APPROVED', 'PENDING'] } // Ne pas toucher aux REJECTED
                },
                data: {
                    moderationStatus: 'REJECTED',
                    rejectionReason: 'Compte banni: ' + reason
                } as any,
            });

            return NextResponse.json({ success: true, message: 'Utilisateur banni et annonces masquées' });
        } else if (action === 'unban') {
            // 1. Débannir l'utilisateur
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: false,
                    banReason: null,
                    bannedAt: null,
                },
            } as any);

            // 2. Remettre ses annonces en attente de modération (PENDING)
            // Note: On ne les approuve pas automatiquement, l'admin devra les revalider
            await prisma.ad.updateMany({
                where: {
                    userId: userId,
                    rejectionReason: { startsWith: 'Compte banni' } // Seulement celles rejetées à cause du ban
                },
                data: {
                    moderationStatus: 'PENDING',
                    rejectionReason: null
                } as any,
            });

            return NextResponse.json({ success: true, message: 'Utilisateur débanni - ses annonces sont en attente de modération' });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (error) {
        logServerError(error, { route: '/api/admin/users/status', action: 'manage_user_status' });
        return NextResponse.json({ error: ERROR_MESSAGES.GENERIC }, { status: 500 });
    }
}
