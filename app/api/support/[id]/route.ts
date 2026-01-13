/**
 * API Route: Support Ticket by ID
 * GET - Récupérer un ticket
 * PATCH - Mettre à jour un ticket (admin)
 * DELETE - Supprimer un ticket (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/admin-auth';
import { SupportService } from '@/services/supportService';
import { TicketStatus } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Récupérer un ticket
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // 1. Vérifier session Admin dédiée (Connexion classique)
        const adminSession = await getAdminSession();

        // 2. Vérifier session NextAuth (Utilisateur)
        const nextAuthSession = !adminSession ? await getServerSession(authOptions) : null;

        const isAdmin = !!adminSession;
        const userId = nextAuthSession?.user?.id;

        if (!isAdmin && !userId) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const ticket = await SupportService.getTicketById(id);

        if (!ticket) {
            return NextResponse.json(
                { success: false, error: 'Ticket non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur a accès (s'il n'est pas admin)
        if (!isAdmin && ticket.userId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true, data: ticket });

    } catch (error) {
        console.error('Erreur GET /api/support/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// PATCH - Mettre à jour un ticket (admin: répondre, changer statut)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // 1. Vérifier session Admin dédiée (Connexion classique)
        const adminSession = await getAdminSession();

        // 2. Vérifier session NextAuth (Utilisateur)
        const nextAuthSession = !adminSession ? await getServerSession(authOptions) : null;

        const isAdmin = !!adminSession;
        const adminId = adminSession?.admin?.id || nextAuthSession?.user?.id;

        if (!isAdmin || !adminId) {
            return NextResponse.json(
                { success: false, error: 'Réservé aux administrateurs' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, adminResponse } = body;

        // Si réponse admin
        if (adminResponse) {
            const ticket = await SupportService.respondToTicket(id, adminId, adminResponse);

            // Revalidate user's support pages
            revalidatePath('/dashboard/support');
            revalidatePath('/dashboard/support/mes-demandes');

            return NextResponse.json({
                success: true,
                data: ticket,
                message: 'Réponse envoyée avec succès'
            });
        }

        // Si changement de statut
        if (status) {
            const validStatuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { success: false, error: 'Statut invalide' },
                    { status: 400 }
                );
            }

            const ticket = await SupportService.changeStatus(id, status);

            // Revalidate user's support pages
            revalidatePath('/dashboard/support');
            revalidatePath('/dashboard/support/mes-demandes');

            return NextResponse.json({ success: true, data: ticket });
        }

        return NextResponse.json(
            { success: false, error: 'Aucune modification fournie' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Erreur PATCH /api/support/[id]:', error);
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer un ticket (admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // 1. Vérifier session Admin dédiée (Connexion classique)
        const adminSession = await getAdminSession();

        // 2. Vérifier session NextAuth (Utilisateur)
        const nextAuthSession = !adminSession ? await getServerSession(authOptions) : null;

        const isAdmin = !!adminSession;

        if (!isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Réservé aux administrateurs' },
                { status: 403 }
            );
        }

        await SupportService.deleteTicket(id);

        return NextResponse.json({
            success: true,
            message: 'Ticket supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur DELETE /api/support/[id]:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
