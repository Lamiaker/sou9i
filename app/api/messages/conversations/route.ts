import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'

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

/**
 * POST /api/messages/conversations
 * Créer une nouvelle conversation ou récupérer une existante
 * Body: { recipientId: string, adTitle?: string, adId?: string }
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
        const { recipientId, adTitle, adId } = body

        if (!recipientId) {
            return NextResponse.json(
                { success: false, error: 'recipientId requis' },
                { status: 400 }
            )
        }

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
        console.error('Erreur POST conversation:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
