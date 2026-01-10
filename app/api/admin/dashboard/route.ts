/**
 * API Route: Admin Dashboard
 * 
 * Utilise le système d'authentification admin séparé.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { AdminService } from '@/services';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // ✅ Nouvelle vérification avec système admin séparé
        const authResult = await requireAdmin(request);

        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const stats = await AdminService.getDashboardStats();
        const activity = await AdminService.getRecentActivity();

        return NextResponse.json({
            success: true,
            data: { stats, activity }
        });
    } catch (error) {
        console.error('Admin dashboard API error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


