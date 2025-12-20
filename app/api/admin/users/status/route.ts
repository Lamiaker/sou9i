import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: true,
                    banReason: reason,
                    bannedAt: new Date(),
                },
            } as any);

            return NextResponse.json({ success: true, message: 'Utilisateur banni avec succès' });
        } else if (action === 'unban') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: false,
                    banReason: null,
                    bannedAt: null,
                },
            } as any);

            return NextResponse.json({ success: true, message: 'Utilisateur débanni avec succès' });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (error) {
        console.error('Admin user status error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
