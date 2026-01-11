

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SupportService } from '@/services/supportService';
import { TicketCategory, TicketStatus } from '@prisma/client';
import { z } from 'zod';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';
import { checkSupportRateLimit, getClientIP } from '@/lib/rate-limit-hybrid';

// ✅ SÉCURITÉ: Schéma de validation Zod
const createTicketSchema = z.object({
    subject: z.string()
        .min(5, 'Le sujet doit contenir au moins 5 caractères')
        .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
        .trim(),
    message: z.string()
        .min(10, 'Le message doit contenir au moins 10 caractères')
        .max(5000, 'Le message ne peut pas dépasser 5000 caractères')
        .trim(),
    category: z.enum(['QUESTION', 'BUG', 'REPORT_CONTENT', 'SUGGESTION', 'ACCOUNT', 'PAYMENT', 'OTHER']),
    guestEmail: z.string().email('Email invalide').optional(),
    guestName: z.string().max(100).optional(),
});

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
        // Session optionnelle (permet tickets anonymes)
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        // ✅ SÉCURITÉ: Rate limiting par IP ou userId
        const identifier = userId || getClientIP(request);
        const rateLimitResult = await checkSupportRateLimit(identifier);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Vous avez atteint la limite de tickets. Veuillez réessayer plus tard.',
                    retryAfter: rateLimitResult.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 60),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                    }
                }
            );
        }

        // ✅ SÉCURITÉ: Validation Zod
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Corps de la requête invalide' },
                { status: 400 }
            );
        }

        const validation = createTicketSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || 'Données invalides';
            return NextResponse.json(
                { success: false, error: firstError },
                { status: 400 }
            );
        }

        const { subject, message, category, guestEmail, guestName } = validation.data;

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
        revalidatePath('/sl-panel-9x7k/support');

        return NextResponse.json({
            success: true,
            data: ticket,
            message: 'Votre demande a été envoyée avec succès'
        });

    } catch (error) {
        logServerError(error, { route: '/api/support', action: 'create_ticket' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}


