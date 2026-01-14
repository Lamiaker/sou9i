import { Server as HttpServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
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

// Map pour garder trace des utilisateurs connectés (local au worker)
const userSockets = new Map<string, Set<string>>()

// Variable locale pour le mode Pages Router (next dev / compatibilité)
let localIO: SocketIOServer | null = null

// Déclaration du type global pour TypeScript
declare global {
    // eslint-disable-next-line no-var
    var io: SocketIOServer | undefined
    // eslint-disable-next-line no-var
    var httpServer: HttpServer | undefined
}

/**
 * Configure l'adapter Redis pour Socket.io
 * Permet la synchronisation des messages entre workers PM2
 */
async function setupRedisAdapter(socketServer: SocketIOServer): Promise<void> {
    // Vérifier si Redis est configuré
    const redisHost = process.env.REDIS_HOST
    const redisPort = process.env.REDIS_PORT

    if (!redisHost && !process.env.REDIS_URL) {
        console.log('[Socket.io] Redis non configuré, mode single-instance')
        return
    }

    try {
        const redisConfig = process.env.REDIS_URL
            ? { url: process.env.REDIS_URL }
            : {
                socket: {
                    host: redisHost || '127.0.0.1',
                    port: parseInt(redisPort || '6379'),
                },
                password: process.env.REDIS_PASSWORD || undefined,
            }

        // Créer deux clients Redis (pub et sub)
        const pubClient = createClient(redisConfig)
        const subClient = pubClient.duplicate()

        pubClient.on('error', (err) => console.error('[Socket.io Redis Pub] Erreur:', err.message))
        subClient.on('error', (err) => console.error('[Socket.io Redis Sub] Erreur:', err.message))

        await Promise.all([pubClient.connect(), subClient.connect()])

        // Appliquer l'adapter Redis
        socketServer.adapter(createAdapter(pubClient, subClient))

        console.log('[Socket.io] Adapter Redis connecté ✓')
    } catch (error) {
        console.error('[Socket.io] Erreur connexion Redis adapter:', error)
        console.log('[Socket.io] Fallback en mode single-instance')
    }
}

/**
 * Initialise le serveur Socket.io (utilisé par la route API ou le custom server)
 */
export async function initSocketServer(httpServer: HttpServer): Promise<SocketIOServer> {
    // Si déjà initialisé (globalement ou localement), retourner l'instance existante
    if (global.io) return global.io
    if (localIO) return localIO

    const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NEXTAUTH_URL || process.env.SOCKET_IO_CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Polling en premier pour compatibilité Cloudflare
        transports: ['polling', 'websocket'],
        // Timeouts plus longs pour Cloudflare
        pingTimeout: 60000,
        pingInterval: 25000,
        // Permettre l'upgrade vers WebSocket après connexion polling
        allowUpgrades: true,
        // Options HTTP long-polling
        httpCompression: true,
    })

    // Configurer l'adapter Redis en production
    if (process.env.NODE_ENV === 'production') {
        await setupRedisAdapter(io)
    }

    io.on('connection', (socket: Socket) => {
        console.log(`[Socket.io] Nouvelle connexion: ${socket.id}`)

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
                console.log(`[Socket.io] Utilisateur ${userId} authentifié`)
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
        socket.on('disconnect', (reason) => {
            console.log(`[Socket.io] Déconnexion: ${socket.id} (${reason})`)
            const userId = socket.data.userId
            if (userId) {
                const sockets = userSockets.get(userId)
                sockets?.delete(socket.id)
                if (sockets?.size === 0) userSockets.delete(userId)
            }
        })
    })

    // Stocker l'instance localement ET globalement
    localIO = io
    global.io = io

    console.log('[Socket.io] Serveur initialisé ✓')

    return io
}

/**
 * Récupère l'instance Socket.IO
 * Vérifie d'abord la variable globale (custom server), puis la variable locale (Pages Router)
 */
export function getIO(): SocketIOServer | null {
    // 1. Vérifier l'instance globale (custom server en production)
    if (global.io) {
        return global.io
    }
    // 2. Fallback sur l'instance locale (next dev / Pages Router)
    return localIO
}

/**
 * Helper pour diffuser un nouveau message depuis n'importe où (ex: API REST)
 * Avec Redis adapter, le message sera propagé à tous les workers
 */
export function broadcastNewMessage(message: NewMessageEvent) {
    const io = getIO()
    if (io) {
        io.to(`conversation:${message.conversationId}`).emit('new_message', message)
        console.log(`[Socket.io] Message broadcast -> conversation:${message.conversationId}`)
    } else {
        console.warn('[Socket.io] ⚠️ Instance IO non disponible - message non diffusé')
        // En production, ceci ne devrait JAMAIS arriver si le custom server est utilisé
    }
}

/**
 * Helper pour notifier d'une lecture de message
 */
export function broadcastMessagesRead(conversationId: string, userId: string) {
    const io = getIO()
    if (io) {
        io.to(`conversation:${conversationId}`).emit('messages_read', {
            conversationId,
            userId,
        })
    }
}
