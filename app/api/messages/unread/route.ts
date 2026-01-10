import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MessageService } from '@/services'

/**
 * GET /api/messages/unread
 * Récupérer le nombre de messages non lus
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

        const count = await MessageService.countUnreadMessages(session.user.id)

        return NextResponse.json({
            success: true,
            data: { count },
        })
    } catch (error) {
        console.error('Erreur GET unread count:', error)
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        )
    }
}


