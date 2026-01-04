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
    createdAt: Date | string
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
    isTyping: boolean
}

// Map pour garder trace des utilisateurs connectés
const userSockets = new Map<string, Set<string>>()

let io: SocketIOServer | null = null

/**
 * Initialise le serveur Socket.io (utilisé par la route API)
 */
export function initSocketServer(httpServer: any): SocketIOServer {
    if (io) return io

    io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    })

    io.on('connection', (socket: Socket) => {
        console.log('🔌 Client connecté:', socket.id)

        // Authentification
        socket.on('authenticate', async (userId: string) => {
            if (!userId) return

            socket.data.userId = userId
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set())
            }
            userSockets.get(userId)?.add(socket.id)

            // Rejoindre automatiquement les rooms de ses conversations
            try {
                const conversations = await MessageService.getUserConversations(userId)
                conversations.forEach((conv) => {
                    socket.join(`conversation:${conv.id}`)
                })
                socket.emit('authenticated', { userId })
            } catch (error) {
                console.error('Socket Auth Error:', error)
            }
        })

        // Gestion des Rooms
        socket.on('join_conversation', (conversationId: string) => {
            socket.join(`conversation:${conversationId}`)
        })

        socket.on('leave_conversation', (conversationId: string) => {
            socket.leave(`conversation:${conversationId}`)
        })

        // Indicateur de frappe (pur temps réel, pas de DB)
        socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
            const userId = socket.data.userId
            if (!userId) return
            socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
                conversationId: data.conversationId,
                userId,
                isTyping: data.isTyping,
            } as UserTypingEvent)
        })

        // Marquage comme lu (synchrone avec la DB)
        socket.on('mark_read', async (data: { conversationId: string }) => {
            const userId = socket.data.userId
            if (!userId) return

            try {
                await MessageService.markMessagesAsRead(data.conversationId, userId)
            } catch (error) {
                console.error('Error mark_read socket:', error)
            }
        })

        // Déconnexion
        socket.on('disconnect', () => {
            const userId = socket.data.userId
            if (userId) {
                const sockets = userSockets.get(userId)
                sockets?.delete(socket.id)
                if (sockets?.size === 0) userSockets.delete(userId)
            }
        })
    })

    return io
}

export function getIO(): SocketIOServer | null {
    return io
}

/**
 * Helper pour diffuser un nouveau message depuis n'importe où (ex: API REST)
 */
export function broadcastNewMessage(message: NewMessageEvent) {
    if (io) {
        io.to(`conversation:${message.conversationId}`).emit('new_message', message)

        // Optionnel : Notifier spécifiquement les sockets de l'utilisateur (pour les badges hors conversation active)
        // Note: socket.io rooms s'occupent déjà de ça si l'utilisateur est dans la room
    }
}

/**
 * Helper pour notifier d'une lecture de message
 */
export function broadcastMessagesRead(conversationId: string, userId: string) {
    if (io) {
        io.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            userId,
        })
    }
}

