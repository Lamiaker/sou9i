import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

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

        const body = await request.json();
        const { reason, details, adId, reportedUserId } = body;

        // Validation
        if (!reason) {
            return NextResponse.json(
                { error: 'La raison du signalement est requise' },
                { status: 400 }
            );
        }

        if (!VALID_REASONS.includes(reason)) {
            return NextResponse.json(
                { error: 'Raison de signalement invalide' },
                { status: 400 }
            );
        }

        if (!adId && !reportedUserId) {
            return NextResponse.json(
                { error: 'Vous devez signaler une annonce ou un utilisateur' },
                { status: 400 }
            );
        }

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
