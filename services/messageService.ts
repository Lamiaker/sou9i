import { prisma } from '@/lib/prisma'
import { NotificationService } from './notificationService'
import { NotificationType } from '@prisma/client'
import type {
    CreateMessageDTO,
    CreateConversationDTO,
    ConversationWithDetailsDTO,
} from '@/types'

// Ré-exporter les types pour compatibilité avec le code existant
export type CreateMessageData = CreateMessageDTO
export type CreateConversationData = CreateConversationDTO

// Extension locale avec les champs optionnels supplémentaires
export interface ConversationWithDetails extends Omit<ConversationWithDetailsDTO, 'participants'> {
    participants: {
        id: string
        name: string | null
        avatar: string | null
        email: string
    }[]
    lastMessage?: {
        content: string
        createdAt: Date
        senderId: string
    }
    unreadCount?: number
}

export const MessageService = {
    /**
     * Récupérer toutes les conversations d'un utilisateur
     */
    async getUserConversations(userId: string): Promise<ConversationWithDetails[]> {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: userId,
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Dernier message seulement
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        })

        // Ajouter le compteur de messages non lus pour chaque conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        read: false,
                        senderId: {
                            not: userId, // Messages non lus envoyés par les autres
                        },
                    },
                })

                return {
                    ...conv,
                    lastMessage: conv.messages[0] || null,
                    unreadCount,
                }
            })
        )

        return conversationsWithUnread as ConversationWithDetails[]
    },

    /**
     * Récupérer une conversation par ID avec tous ses messages
     */
    async getConversationById(
        conversationId: string,
        userId: string
    ): Promise<ConversationWithDetails | null> {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        id: userId, // Vérifier que l'utilisateur est participant
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        })

        return conversation as ConversationWithDetails | null
    },

    /**
     * Trouver ou créer une conversation entre deux utilisateurs pour une annonce
     */
    async findOrCreateConversation(
        userId1: string,
        userId2: string,
        adTitle?: string,
        adId?: string
    ): Promise<ConversationWithDetails> {
        // Chercher une conversation existante entre ces deux utilisateurs
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { id: userId1 } } },
                    { participants: { some: { id: userId2 } } },
                    // Si un adId est fourni, chercher la conversation spécifique à cette annonce
                    ...(adId ? [{ adId }] : []),
                ],
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        })

        if (existingConversation) {
            return existingConversation as ConversationWithDetails
        }

        // Créer une nouvelle conversation
        const newConversation = await prisma.conversation.create({
            data: {
                adTitle: adTitle || null,
                adId: adId || null,
                participants: {
                    connect: [{ id: userId1 }, { id: userId2 }],
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        email: true,
                    },
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
        })

        return newConversation as ConversationWithDetails
    },

    /**
     * Créer un nouveau message
     */
    async createMessage(data: CreateMessageData): Promise<{
        id: string
        content: string
        read: boolean
        createdAt: Date
        senderId: string
        conversationId: string
        sender: {
            id: string
            name: string | null
            avatar: string | null
        }
    }> {
        // Vérifier que l'utilisateur est participant à la conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: data.conversationId,
                participants: {
                    some: {
                        id: data.senderId,
                    },
                },
            },
        })

        if (!conversation) {
            throw new Error('Conversation non trouvée ou accès refusé')
        }

        // Créer le message
        const message = await prisma.message.create({
            data: {
                content: data.content,
                senderId: data.senderId,
                conversationId: data.conversationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        })

        // Mettre à jour le timestamp de la conversation
        const updatedConv = await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { updatedAt: new Date() },
            include: {
                participants: {
                    where: {
                        id: { not: data.senderId }
                    },
                    select: { id: true }
                }
            }
        })

        // --- TEMPS RÉEL (Socket.io) ---
        try {
            const { broadcastNewMessage } = await import('@/lib/socket')
            broadcastNewMessage({
                ...message,
                conversationId: data.conversationId,
            })
        } catch (error) {
            console.error('Erreur broadcast socket:', error)
        }

        // Envoyer une notification (DB) aux autres participants
        for (const participant of updatedConv.participants) {
            await NotificationService.create({
                userId: participant.id,
                type: NotificationType.NEW_MESSAGE,
                title: `Nouveau message de ${message.sender.name || 'un utilisateur'}`,
                message: message.content.length > 50 ? `${message.content.substring(0, 47)}...` : message.content,
                link: `/dashboard/messages?conversation=${data.conversationId}`
            });
        }

        return message
    },

    /**
     * Marquer les messages comme lus
     */
    async markMessagesAsRead(conversationId: string, userId: string): Promise<number> {
        const result = await prisma.message.updateMany({
            where: {
                conversationId,
                read: false,
                senderId: {
                    not: userId, // Marquer comme lus seulement les messages des autres
                },
            },
            data: {
                read: true,
            },
        })

        if (result.count > 0) {
            // --- TEMPS RÉEL (Socket.io) ---
            try {
                const { broadcastMessagesRead } = await import('@/lib/socket')
                broadcastMessagesRead(conversationId, userId)
            } catch (error) {
                console.error('Erreur broadcast read socket:', error)
            }
        }

        return result.count
    },

    /**
     * Compter le nombre total de messages non lus pour un utilisateur
     */
    async countUnreadMessages(userId: string): Promise<number> {
        // D'abord, récupérer toutes les conversations de l'utilisateur
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        id: userId,
                    },
                },
            },
            select: {
                id: true,
            },
        })

        const conversationIds = conversations.map((c) => c.id)

        // Compter les messages non lus dans ces conversations
        const count = await prisma.message.count({
            where: {
                conversationId: {
                    in: conversationIds,
                },
                read: false,
                senderId: {
                    not: userId,
                },
            },
        })

        return count
    },

    /**
     * Supprimer une conversation (soft delete ou hard delete selon besoin)
     */
    async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
        // Vérifier que l'utilisateur est participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: {
                        id: userId,
                    },
                },
            },
        })

        if (!conversation) {
            throw new Error('Conversation non trouvée ou accès refusé')
        }

        // Supprimer tous les messages de la conversation
        await prisma.message.deleteMany({
            where: { conversationId },
        })

        // Supprimer la conversation
        await prisma.conversation.delete({
            where: { id: conversationId },
        })

        return true
    },

    /**
     * Récupérer les messages d'une conversation avec pagination
     */
    async getMessages(
        conversationId: string,
        userId: string,
        page: number = 1,
        limit: number = 50
    ) {
        // Vérifier l'accès
        const isParticipant = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: {
                    some: { id: userId },
                },
            },
        })

        if (!isParticipant) {
            throw new Error('Accès refusé')
        }

        const skip = (page - 1) * limit

        const [messages, total] = await Promise.all([
            prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            }),
            prisma.message.count({
                where: { conversationId },
            }),
        ])

        return {
            messages: messages.reverse(), // Remettre en ordre chronologique
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    },

    /**
     * Récupérer les participants d'une conversation (pour WebSocket)
     */
    async getConversationParticipants(conversationId: string): Promise<string[]> {
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: {
                    select: { id: true },
                },
            },
        })

        return conversation?.participants.map((p) => p.id) || []
    },
}
