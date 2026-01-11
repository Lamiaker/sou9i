import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'
import { z } from 'zod'
import { logServerError, ERROR_MESSAGES } from '@/lib/errors'
import { createRateLimiter } from '@/lib/rate-limit-enhanced'

// ✅ SÉCURITÉ: Rate limiter pour la création de conversations (20/heure)
const conversationRateLimiter = createRateLimiter('conversations', {
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 heure
    message: 'Trop de conversations créées. Veuillez patienter.',
});

// ✅ SÉCURITÉ: Schéma de validation Zod
const createConversationSchema = z.object({
    recipientId: z.string().regex(/^c[a-z0-9]{24,}$/i, 'ID destinataire invalide'),
    adTitle: z.string().max(200).optional(),
    adId: z.string().regex(/^c[a-z0-9]{24,}$/i, 'ID annonce invalide').optional(),
});

/**
 * GET /api/messages/conversations
 * Récupérer toutes les conversations de l'utilisateur connecté
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const conversations = await MessageService.getUserConversations(session.user.id)

        return NextResponse.json({
            success: true,
            data: conversations,
        })
    } catch (error) {
        console.error('Erreur GET conversations:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}


export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // ✅ SÉCURITÉ: Rate Limiting
        const rateLimit = conversationRateLimiter.check(session.user.id)
        if (!rateLimit.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Trop de conversations créées. Veuillez patienter.',
                    retryAfter: rateLimit.retryAfter
                },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.retryAfter) }
                }
            )
        }

        // ✅ SÉCURITÉ: Validation Zod
        let body
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { success: false, error: 'Corps de la requête invalide' },
                { status: 400 }
            )
        }

        const validation = createConversationSchema.safeParse(body)
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || 'Données invalides'
            return NextResponse.json(
                { success: false, error: firstError },
                { status: 400 }
            )
        }

        const { recipientId, adTitle, adId } = validation.data

        if (recipientId === session.user.id) {
            return NextResponse.json(
                { success: false, error: 'Vous ne pouvez pas démarrer une conversation avec vous-même' },
                { status: 400 }
            )
        }

        const conversation = await MessageService.findOrCreateConversation(
            session.user.id,
            recipientId,
            adTitle,
            adId
        )

        return NextResponse.json({
            success: true,
            data: conversation,
        })
    } catch (error) {
        logServerError(error, { route: '/api/messages/conversations', action: 'create_conversation' })
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}


