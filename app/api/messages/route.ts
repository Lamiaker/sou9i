import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'
import { logServerError, ERROR_MESSAGES } from '@/lib/errors'

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

        const body = await request.json()
        const { conversationId, content } = body

        if (!conversationId || !content) {
            return NextResponse.json(
                { success: false, error: 'conversationId et content requis' },
                { status: 400 }
            )
        }

        if (content.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Le message ne peut pas être vide' },
                { status: 400 }
            )
        }

        const message = await MessageService.createMessage({
            conversationId,
            content: content.trim(),
            senderId: session.user.id,
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
        const conversationId = searchParams.get('conversationId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: 'conversationId requis' },
                { status: 400 }
            )
        }

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
