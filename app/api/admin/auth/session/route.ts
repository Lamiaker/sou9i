/**
 * API Route: Admin Session
 * GET /api/admin/auth/session
 * 
 * Retourne les informations de session de l'admin connecté.
 * Utilisé par le frontend pour vérifier l'état de connexion.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
    try {
        const session = await getAdminSession();

        if (!session) {
            return NextResponse.json(
                { authenticated: false },
                { status: 200 }
            );
        }

        return NextResponse.json({
            authenticated: true,
            admin: {
                id: session.admin.id,
                email: session.admin.email,
                name: session.admin.name,
                isSuperAdmin: session.admin.isSuperAdmin,
                permissions: session.admin.permissions,
            },
            expiresAt: session.expiresAt.toISOString(),
        });

    } catch (error) {
        console.error('Admin session API error:', error);
        return NextResponse.json(
            { authenticated: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}


