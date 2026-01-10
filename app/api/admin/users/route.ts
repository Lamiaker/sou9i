

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getRequestContext } from '@/lib/admin-guard';
import { getAdminSession, logAdminAudit } from '@/lib/admin-auth';
import { AdminService } from '@/services';
import { sanitizePaginationParams } from '@/lib/utils/pagination';
import { PAGINATION } from '@/lib/constants/pagination';
import { AdminPermission } from '@prisma/client';

// GET: Récupérer les utilisateurs avec pagination et filtres
export async function GET(request: NextRequest) {
    try {
        // ✅ Nouvelle vérification avec système admin séparé
        const authResult = await requireAdmin(request, {
            permissions: [AdminPermission.USERS_READ],
        });

        // Si c'est une NextResponse, c'est une erreur d'auth
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { searchParams } = new URL(request.url);
        const { page, limit } = sanitizePaginationParams(
            searchParams.get('page'),
            searchParams.get('limit'),
            { defaultLimit: PAGINATION.DEFAULT_LIMIT_ADMIN }
        );
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || '';
        const status = searchParams.get('status') || 'PENDING';

        const { users, pagination } = await AdminService.getUsers({
            page,
            limit,
            search,
            role,
            status,
        });

        // Format dates for client component serialization
        const formattedUsers = users.map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt).toISOString(),
        }));

        return NextResponse.json({
            success: true,
            users: formattedUsers,
            pagination,
        });
    } catch (error) {
        console.error('Admin users GET API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST: Actions sur les utilisateurs
export async function POST(request: NextRequest) {
    try {
        // Récupérer la session pour les actions qui nécessitent des permissions spécifiques
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Non autorisé', code: 'UNAUTHORIZED' },
                { status: 401 }
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

        // Déterminer les permissions requises selon l'action
        let requiredPermission: AdminPermission;
        switch (action) {
            case 'verify':
            case 'unverify':
            case 'reject':
                requiredPermission = AdminPermission.USERS_WRITE;
                break;
            case 'ban':
            case 'unban':
                requiredPermission = AdminPermission.USERS_BAN;
                break;
            case 'delete':
                requiredPermission = AdminPermission.USERS_DELETE;
                break;
            case 'promote':
            case 'demote':
                requiredPermission = AdminPermission.ADMINS_MANAGE;
                break;
            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }

        // Vérifier la permission (super admin a toutes les permissions)
        const hasPermission = session.admin.isSuperAdmin ||
            session.admin.permissions.includes(requiredPermission);

        if (!hasPermission) {
            return NextResponse.json(
                { error: 'Permission insuffisante pour cette action', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }

        // Récupérer contexte pour l'audit
        const { ipAddress, userAgent } = getRequestContext(request);

        // Exécuter l'action et logger
        let result: { success: boolean; message: string };

        switch (action) {
            case 'verify':
                const { trusted } = body;
                await AdminService.verifyUser(userId, trusted === true);
                result = {
                    success: true,
                    message: trusted ? 'Utilisateur marqué comme de confiance' : 'Utilisateur vérifié'
                };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: trusted ? 'USER_TRUSTED' : 'USER_VERIFIED',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            case 'unverify':
                await AdminService.unverifyUser(userId);
                result = { success: true, message: 'Vérification retirée' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_UNVERIFIED',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            case 'reject':
                const { reason } = body;
                if (!reason) {
                    return NextResponse.json({ error: 'Motif requis pour le rejet' }, { status: 400 });
                }
                await AdminService.rejectUser(userId, reason);
                result = { success: true, message: 'Utilisateur rejeté' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_REJECTED',
                    targetType: 'User',
                    targetId: userId,
                    details: { reason },
                    ipAddress,
                    userAgent,
                });
                break;

            case 'ban':
                const { banReason } = body;
                await AdminService.banUser(userId, banReason);
                result = { success: true, message: 'Utilisateur banni' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_BANNED',
                    targetType: 'User',
                    targetId: userId,
                    details: { reason: banReason },
                    ipAddress,
                    userAgent,
                });
                break;

            case 'unban':
                await AdminService.unbanUser(userId);
                result = { success: true, message: 'Utilisateur débanni' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_UNBANNED',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            case 'promote':
                await AdminService.promoteToAdmin(userId);
                result = { success: true, message: 'Utilisateur promu admin' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_PROMOTED_ADMIN',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            case 'demote':
                await AdminService.demoteToUser(userId);
                result = { success: true, message: 'Admin rétrogradé en utilisateur' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'ADMIN_DEMOTED',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            case 'delete':
                await AdminService.deleteUser(userId);
                result = { success: true, message: 'Utilisateur supprimé' };
                await logAdminAudit({
                    adminId: session.admin.id,
                    action: 'USER_DELETED',
                    targetType: 'User',
                    targetId: userId,
                    ipAddress,
                    userAgent,
                });
                break;

            default:
                return NextResponse.json(
                    { error: 'Action non reconnue' },
                    { status: 400 }
                );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Admin users API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}


