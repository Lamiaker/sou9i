import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { MessageService } from '@/services'

// Types pour les événements WebSocket
export interface MessagePayload {
    conversationId: string
    content: string
    senderId: string
}

export interface NewMessageEvent {
    id: string
    content: string
    senderId: string
    conversationId: string
    createdAt: Date
    read: boolean
    sender: {
        id: string
        name: string | null
        avatar: string | null
    }
}

export interface UserTypingEvent {
    conversationId: string
    userId: string
    userName: string
    isTyping: boolean
}

export interface MessageReadEvent {
    conversationId: string
    userId: string
    messageIds: string[]
}

// Map pour garder trace des utilisateurs connectés et leurs sockets
const userSockets = new Map<string, Set<string>>()

let io: SocketIOServer | null = null

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
    if (io) {
        return io
    }

    io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    })

    io.on('connection', (socket: Socket) => {
        console.log('🔌 Client connecté:', socket.id)

        // Authentifier l'utilisateur
        socket.on('authenticate', async (userId: string) => {
            if (!userId) {
                socket.emit('error', { message: 'User ID requis' })
                return
            }

            // Stocker la relation userId -> socket
            socket.data.userId = userId

            // Ajouter ce socket à l'ensemble des sockets de l'utilisateur
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set())
            }
            userSockets.get(userId)?.add(socket.id)

            // Récupérer les conversations et rejoindre les rooms
            try {
                const conversations = await MessageService.getUserConversations(userId)
                conversations.forEach((conv) => {
                    socket.join(`conversation:${conv.id}`)
                })

                console.log(`✅ Utilisateur ${userId} authentifié, ${conversations.length} conversations`)
                socket.emit('authenticated', { userId, conversationsJoined: conversations.length })
            } catch (error) {
                console.error('Erreur authentification socket:', error)
                socket.emit('error', { message: 'Erreur authentification' })
            }
        })

        // Rejoindre une conversation spécifique
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`)
            console.log(`📥 Socket ${socket.id} a rejoint conversation:${conversationId}`)
        })

        // Quitter une conversation
        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`)
            console.log(`📤 Socket ${socket.id} a quitté conversation:${conversationId}`)
        })

        // Envoyer un message
        socket.on('send_message', async (payload: MessagePayload) => {
            const { conversationId, content, senderId } = payload

            if (!conversationId || !content || !senderId) {
                socket.emit('error', { message: 'Données manquantes' })
                return
            }

            try {
                // Créer le message en base
                const message = await MessageService.createMessage({
                    conversationId,
                    content: content.trim(),
                    senderId,
                })

                // Diffuser le message à tous dans la conversation
                io?.to(`conversation:${conversationId}`).emit('new_message', {
                    ...message,
                    conversationId,
                } as NewMessageEvent)

                // Notifier tous les participants de la conversation
                const participants = await MessageService.getConversationParticipants(conversationId)
                participants.forEach((participantId) => {
                    if (participantId !== senderId) {
                        // Envoyer une notification aux autres sockets de ce participant
                        const participantSockets = userSockets.get(participantId)
                        if (participantSockets) {
                            participantSockets.forEach((socketId) => {
                                io?.to(socketId).emit('notification', {
                                    type: 'new_message',
                                    conversationId,
                                    message: {
                                        content: content.substring(0, 50),
                                        senderName: message.sender.name,
                                    },
                                })
                            })
                        }
                    }
                })

                console.log(`📨 Message envoyé dans conversation:${conversationId}`)
            } catch (error) {
                console.error('Erreur envoi message:', error)
                socket.emit('error', { message: 'Erreur envoi message' })
            }
        })

        // Indicateur de frappe
        socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
            const userId = socket.data.userId
            if (!userId) return

            socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
                conversationId: data.conversationId,
                userId,
                isTyping: data.isTyping,
            })
        })

        // Marquer les messages comme lus
        socket.on('mark_read', async (data: { conversationId: string }) => {
            const userId = socket.data.userId
            if (!userId) return

            try {
                await MessageService.markMessagesAsRead(data.conversationId, userId)

                // Notifier les autres participants
                socket.to(`conversation:${data.conversationId}`).emit('messages_read', {
                    conversationId: data.conversationId,
                    userId,
                })
            } catch (error) {
                console.error('Erreur mark_read:', error)
            }
        })

        // Déconnexion
        socket.on('disconnect', () => {
            const userId = socket.data.userId
            if (userId) {
                const sockets = userSockets.get(userId)
                sockets?.delete(socket.id)
                if (sockets?.size === 0) {
                    userSockets.delete(userId)
                }
            }
            console.log('🔌 Client déconnecté:', socket.id)
        })
    })

    console.log('🚀 Socket.IO server initialized')
    return io
}

export function getIO(): SocketIOServer | null {
    return io
}

// Helper pour envoyer un message depuis l'API (sans WebSocket)
export async function emitNewMessage(message: NewMessageEvent) {
    if (io) {
        io.to(`conversation:${message.conversationId}`).emit('new_message', message)
    }
}
