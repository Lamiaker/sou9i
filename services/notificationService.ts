import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

/**
 * Service pour gérer les notifications utilisateur
 */
export class NotificationService {
    /**
     * Créer une nouvelle notification pour un utilisateur
     */
    static async create({
        userId,
        type,
        title,
        message,
        link
    }: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        link?: string;
    }) {
        try {
            return await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    link
                }
            });
        } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            // On ne bloque pas le processus principal si une notification échoue
            return null;
        }
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    static async getUserNotifications(userId: string, limit = 20) {
        return await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Compter les notifications non lues
     */
    static async getUnreadCount(userId: string) {
        return await prisma.notification.count({
            where: {
                userId,
                read: false
            }
        });
    }

    /**
     * Marquer une notification comme lue
     */
    static async markAsRead(notificationId: string) {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    static async markAllAsRead(userId: string) {
        return await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        });
    }

    /**
     * Supprimer une notification
     */
    static async deleteNotification(notificationId: string) {
        return await prisma.notification.delete({
            where: { id: notificationId }
        });
    }
}
