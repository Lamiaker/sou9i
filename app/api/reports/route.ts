import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';
import { reportRateLimiter } from '@/lib/rate-limit-enhanced';
import { z } from 'zod';

// ✅ SÉCURITÉ: Schéma de validation Zod pour les signalements
const reportSchema = z.object({
    reason: z.enum([
        'Fraude ou arnaque',
        'Contenu inapproprié',
        'Produit interdit',
        'Fausse annonce',
        'Harcèlement',
        'Spam ou publicité',
        'Autre'
    ]),
    details: z.string().max(2000, 'Les détails sont limités à 2000 caractères').optional(),
    adId: z.string().regex(/^c[a-z0-9]{24,}$/i, 'ID annonce invalide').optional(),
    reportedUserId: z.string().regex(/^c[a-z0-9]{24,}$/i, 'ID utilisateur invalide').optional(),
}).refine(data => data.adId || data.reportedUserId, {
    message: 'Vous devez signaler une annonce ou un utilisateur',
});

// Raisons de signalement prédéfinies
const VALID_REASONS = [
    'Fraude ou arnaque',
    'Contenu inapproprié',
    'Produit interdit',
    'Fausse annonce',
    'Harcèlement',
    'Spam ou publicité',
    'Autre'
];

// POST - Créer un signalement
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Vous devez être connecté pour signaler' },
                { status: 401 }
            );
        }

        // ✅ SÉCURITÉ: Rate Limiting (5 signalements / heure)
        const rateLimit = reportRateLimiter.check(session.user.id);
        if (!rateLimit.success) {
            return NextResponse.json(
                {
                    error: 'Vous avez atteint la limite de signalements. Veuillez réessayer plus tard.',
                    retryAfter: rateLimit.retryAfter
                },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.retryAfter) }
                }
            );
        }

        // ✅ SÉCURITÉ: Validation Zod
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Corps de la requête invalide' },
                { status: 400 }
            );
        }

        const validation = reportSchema.safeParse(body);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || 'Données invalides';
            return NextResponse.json(
                { error: firstError },
                { status: 400 }
            );
        }

        const { reason, details, adId, reportedUserId } = validation.data;

        // Empêcher de se signaler soi-même
        if (reportedUserId && reportedUserId === session.user.id) {
            return NextResponse.json(
                { error: 'Vous ne pouvez pas vous signaler vous-même' },
                { status: 400 }
            );
        }

        // Vérifier si l'annonce existe
        if (adId) {
            const ad = await prisma.ad.findUnique({
                where: { id: adId },
                select: { id: true, userId: true }
            });

            if (!ad) {
                return NextResponse.json(
                    { error: 'Annonce non trouvée' },
                    { status: 404 }
                );
            }

            // Empêcher de signaler sa propre annonce
            if (ad.userId === session.user.id) {
                return NextResponse.json(
                    { error: 'Vous ne pouvez pas signaler votre propre annonce' },
                    { status: 400 }
                );
            }
        }

        // Vérifier si l'utilisateur signalé existe
        if (reportedUserId) {
            const user = await prisma.user.findUnique({
                where: { id: reportedUserId },
                select: { id: true }
            });

            if (!user) {
                return NextResponse.json(
                    { error: 'Utilisateur non trouvé' },
                    { status: 404 }
                );
            }
        }

        // Vérifier si un signalement similaire existe déjà (même reporter, même cible)
        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId: session.user.id,
                ...(adId && { adId }),
                ...(reportedUserId && { reportedUserId }),
                status: 'PENDING'
            }
        });

        if (existingReport) {
            return NextResponse.json(
                { error: 'Vous avez déjà signalé cet élément. Il est en cours de traitement.' },
                { status: 409 }
            );
        }

        // Créer le signalement
        const report = await prisma.report.create({
            data: {
                reason,
                details: details || null,
                reporterId: session.user.id,
                adId: adId || null,
                reportedUserId: reportedUserId || null,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Signalement envoyé. Notre équipe va l\'examiner.',
            reportId: report.id
        });

    } catch (error) {
        logServerError(error, { route: '/api/reports', action: 'create_report' });
        return NextResponse.json(
            { error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}

// GET - Récupérer les raisons de signalement disponibles
export async function GET() {
    return NextResponse.json({
        reasons: VALID_REASONS
    });
}


