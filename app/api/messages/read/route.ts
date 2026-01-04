import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'
import { broadcastMessagesRead } from '@/lib/socket'

/**
 * PATCH /api/messages/read
 * Marquer une conversation comme lue
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { conversationId } = body

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: 'ID de conversation requis' },
                { status: 400 }
            )
        }

        // Marquer en DB
        await MessageService.markMessagesAsRead(conversationId, session.user.id)

        // Broadcaster via Socket.io (pour synchronisation temps réel des onglets de l'utilisateur)
        broadcastMessagesRead(conversationId, session.user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Erreur API mark as read:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}
