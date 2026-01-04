/**
 * API Route: Support Tickets
 * GET - Récupérer les tickets (user: ses tickets, admin: tous)
 * POST - Créer un nouveau ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SupportService } from '@/services/supportService';
import { TicketCategory, TicketStatus } from '@prisma/client';

// GET - Récupérer les tickets
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as string | null;
        const category = searchParams.get('category') as string | null;

        // Admin peut voir tous les tickets
        if (session.user.role === 'ADMIN') {
            const tickets = await SupportService.getAllTickets({
                status: status as TicketStatus | undefined,
                category: category as TicketCategory | undefined,
            });

            return NextResponse.json({ success: true, data: tickets });
        }

        // User voit ses propres tickets
        const tickets = await SupportService.getUserTickets(session.user.id);

        return NextResponse.json({ success: true, data: tickets });

    } catch (error) {
        console.error('Erreur GET /api/support:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST - Créer un ticket
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subject, message, category, guestEmail, guestName } = body;

        // Validation catégorie
        const validCategories: TicketCategory[] = [
            'QUESTION', 'BUG', 'REPORT_CONTENT', 'SUGGESTION', 'ACCOUNT', 'PAYMENT', 'OTHER'
        ];

        if (!category || !validCategories.includes(category)) {
            return NextResponse.json(
                { success: false, error: 'Catégorie invalide' },
                { status: 400 }
            );
        }

        // Session optionnelle (permet tickets anonymes)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // Si pas connecté, email requis
        if (!userId && !guestEmail) {
            return NextResponse.json(
                { success: false, error: 'Email requis pour les utilisateurs non connectés' },
                { status: 400 }
            );
        }

        const ticket = await SupportService.createTicket({
            subject,
            message,
            category,
            userId: userId || undefined,
            guestEmail: !userId ? guestEmail : undefined,
            guestName: !userId ? guestName : undefined,
        });

        // Revalider les pages dashboard pour l'utilisateur
        revalidatePath('/dashboard/support');
        revalidatePath('/admin/support');

        return NextResponse.json({
            success: true,
            data: ticket,
            message: 'Votre demande a été envoyée avec succès'
        });

    } catch (error) {
        console.error('Erreur POST /api/support:', error);
        const message = error instanceof Error ? error.message : 'Erreur serveur';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
