import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'

interface RouteContext {
    params: Promise<{ id: string }>
}

/**
 * GET /api/messages/conversations/[id]
 * Récupérer une conversation avec ses messages
 */
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const params = await context.params
        const conversationId = params.id

        const conversation = await MessageService.getConversationById(
            conversationId,
            session.user.id
        )

        if (!conversation) {
            return NextResponse.json(
                { success: false, error: 'Conversation non trouvée' },
                { status: 404 }
            )
        }

        // Marquer les messages comme lus
        await MessageService.markMessagesAsRead(conversationId, session.user.id)

        return NextResponse.json({
            success: true,
            data: conversation,
        })
    } catch (error) {
        console.error('Erreur GET conversation:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/messages/conversations/[id]
 * Supprimer une conversation
 */
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const params = await context.params
        const conversationId = params.id

        await MessageService.deleteConversation(conversationId, session.user.id)

        return NextResponse.json({
            success: true,
            message: 'Conversation supprimée',
        })
    } catch (error) {
        console.error('Erreur DELETE conversation:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/messages/conversations/[id]/read
 * Marquer explicitement comme lu
 */
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
        }

        const params = await context.params
        await MessageService.markMessagesAsRead(params.id, session.user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur PATCH conversation:', error)
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
    }
}
