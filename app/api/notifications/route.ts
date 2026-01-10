import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NotificationService } from '@/services/notificationService';

/**
 * GET: Récupérer les notifications de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const notifications = await NotificationService.getUserNotifications(session.user.id);
        const unreadCount = await NotificationService.getUnreadCount(session.user.id);

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Erreur API Notifications:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * PATCH: Marquer une ou toutes les notifications comme lues
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, all } = body;

        if (all) {
            await NotificationService.markAllAsRead(session.user.id);
        } else if (notificationId) {
            await NotificationService.markAsRead(notificationId);
        } else {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur API Notifications PATCH:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}


