

import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
    try {
        await logoutAdmin();

        return NextResponse.json({
            success: true,
            message: 'Déconnexion réussie'
        });

    } catch (error) {
        console.error('Admin logout API error:', error);
        // Même en cas d'erreur, on considère la déconnexion réussie
        // car le cookie sera de toute façon supprimé
        return NextResponse.json({
            success: true,
            message: 'Déconnexion effectuée'
        });
    }
}


