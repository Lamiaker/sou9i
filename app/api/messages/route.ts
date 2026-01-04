import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'
import { logServerError, ERROR_MESSAGES } from '@/lib/errors'
import { sendMessageSchema, getMessagesSchema, validateRequest, validateSearchParams } from '@/lib/validations'
import { messageRateLimiter } from '@/lib/rate-limit-enhanced'

/**
 * POST /api/messages
 * Envoyer un nouveau message
 * Body: { conversationId: string, content: string }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // ✅ SÉCURITÉ: Rate Limiting (30 messages / minute)
        const rateLimit = messageRateLimiter.check(userId)
        if (!rateLimit.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Vous envoyez trop de messages. Veuillez patienter.",
                    retryAfter: rateLimit.retryAfter
                },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.retryAfter) }
                }
            )
        }

        // ✅ SÉCURITÉ: Validation Zod
        const validation = await validateRequest(request, sendMessageSchema)
        if (!validation.success) {
            return validation.response
        }

        const { conversationId, content } = validation.data

        const message = await MessageService.createMessage({
            conversationId,
            content: content.trim(),
            senderId: userId,
        })

        return NextResponse.json({
            success: true,
            data: message,
        })
    } catch (error) {
        logServerError(error, { route: '/api/messages', action: 'create_message' })
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}

/**
 * GET /api/messages?conversationId=xxx&page=1&limit=50
 * Récupérer les messages d'une conversation avec pagination
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)

        // ✅ SÉCURITÉ: Validation Zod pour les query params
        const validation = validateSearchParams(searchParams, getMessagesSchema)
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Paramètres invalides', details: validation.errors },
                { status: 400 }
            )
        }

        const { conversationId, page, limit } = validation.data

        const result = await MessageService.getMessages(
            conversationId,
            session.user.id,
            page,
            limit
        )

        return NextResponse.json({
            success: true,
            data: result.messages,
            pagination: result.pagination,
        })
    } catch (error) {
        logServerError(error, { route: '/api/messages', action: 'get_messages' })
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}

