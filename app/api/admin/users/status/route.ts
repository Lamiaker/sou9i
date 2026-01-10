import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, logAdminAudit } from '@/lib/admin-auth';
import { getRequestContext } from '@/lib/admin-guard';
import { prisma } from '@/lib/prisma';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';
import { AdminPermission } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(AdminPermission.USERS_BAN);
        if (!hasPermission) {
            return NextResponse.json({ error: 'Permission insuffisante' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, action, reason } = body;

        if (!userId) {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (targetUser?.role === 'ADMIN') {
            return NextResponse.json({ error: 'Impossible de modifier un compte administrateur' }, { status: 403 });
        }

        const { ipAddress, userAgent } = getRequestContext(request);

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

            await prisma.ad.updateMany({
                where: {
                    userId: userId,
                    moderationStatus: { in: ['APPROVED', 'PENDING'] }
                },
                data: {
                    moderationStatus: 'REJECTED',
                    rejectionReason: 'Compte banni: ' + reason
                } as any,
            });

            await logAdminAudit({
                adminId: session.admin.id,
                action: 'USER_BANNED',
                targetType: 'User',
                targetId: userId,
                details: { reason },
                ipAddress,
                userAgent,
            });

            return NextResponse.json({ success: true, message: 'Utilisateur banni et annonces masquées' });
        } else if (action === 'unban') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    isBanned: false,
                    banReason: null,
                    bannedAt: null,
                },
            } as any);

            await prisma.ad.updateMany({
                where: {
                    userId: userId,
                    rejectionReason: { startsWith: 'Compte banni' }
                },
                data: {
                    moderationStatus: 'PENDING',
                    rejectionReason: null
                } as any,
            });

            await logAdminAudit({
                adminId: session.admin.id,
                action: 'USER_UNBANNED',
                targetType: 'User',
                targetId: userId,
                ipAddress,
                userAgent,
            });

            return NextResponse.json({ success: true, message: 'Utilisateur débanni - ses annonces sont en attente de modération' });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (error) {
        logServerError(error, { route: '/api/admin/users/status', action: 'manage_user_status' });
        return NextResponse.json({ error: ERROR_MESSAGES.GENERIC }, { status: 500 });
    }
}


