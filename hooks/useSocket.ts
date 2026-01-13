'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

// Types pour les événements
export interface SocketMessage {
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

export interface TypingEvent {
    conversationId: string
    userId: string
    isTyping: boolean
}

export interface NotificationEvent {
    type: string
    conversationId: string
    message: {
        content: string
        senderName: string | null
    }
}

interface UseSocketOptions {
    autoConnect?: boolean
    onNewMessage?: (message: SocketMessage) => void
    onTyping?: (event: TypingEvent) => void
    onNotification?: (event: NotificationEvent) => void
    onMessagesRead?: (data: { conversationId: string; userId: string }) => void
}

// Singleton pour la connexion Socket.IO
let globalSocket: Socket | null = null
let connectionCount = 0

export function useSocket(options: UseSocketOptions = {}) {
    const { data: session, status } = useSession()
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Utiliser des refs pour les callbacks pour éviter les re-renders
    const onNewMessageRef = useRef(options.onNewMessage)
    const onTypingRef = useRef(options.onTyping)
    const onNotificationRef = useRef(options.onNotification)
    const onMessagesReadRef = useRef(options.onMessagesRead)

    // Mettre à jour les refs quand les callbacks changent
    useEffect(() => {
        onNewMessageRef.current = options.onNewMessage
        onTypingRef.current = options.onTyping
        onNotificationRef.current = options.onNotification
        onMessagesReadRef.current = options.onMessagesRead
    }, [options.onNewMessage, options.onTyping, options.onNotification, options.onMessagesRead])

    const {
        autoConnect = true,
    } = options

    const userIdRef = useRef<string | null>(null)

    // Connexion au serveur Socket.IO
    const connect = useCallback(() => {
        if (globalSocket?.connected) {
            setIsConnected(true)
            return
        }

        if (globalSocket) {
            // Socket existe mais pas connecté, on reconnecte
            globalSocket.connect()
            return
        }

        const socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socket.on('connect', () => {
            console.log('✅ Socket.io connecté')
            setIsConnected(true)

            // Authentifier l'utilisateur
            if (userIdRef.current) {
                socket.emit('authenticate', userIdRef.current)
            }
        })

        socket.on('authenticated', () => {
            console.log('✅ Socket.io authentifié')
            setIsAuthenticated(true)
        })

        socket.on('new_message', (message: SocketMessage) => {
            onNewMessageRef.current?.(message)
        })

        socket.on('user_typing', (event: TypingEvent) => {
            onTypingRef.current?.(event)
        })

        socket.on('notification', (event: NotificationEvent) => {
            onNotificationRef.current?.(event)
        })

        socket.on('messages_read', (data: { conversationId: string; userId: string }) => {
            onMessagesReadRef.current?.(data)
        })

        socket.on('error', (error) => {
            console.error('❌ Socket erreur:', error)
        })

        socket.on('disconnect', (reason) => {
            console.log('⚠️ Socket.io déconnecté:', reason)
            setIsConnected(false)
            setIsAuthenticated(false)
        })

        socket.on('connect_error', (error) => {
            console.error('❌ Socket.io erreur de connexion:', error.message)
        })

        socket.connect()
        globalSocket = socket
    }, [])

    // Déconnexion
    const disconnect = useCallback(() => {
        connectionCount--

        // Ne déconnecter que si plus aucun composant n'utilise le socket
        if (connectionCount <= 0 && globalSocket) {
            console.log('🔌 Déconnexion Socket.io')
            globalSocket.disconnect()
            globalSocket = null
            connectionCount = 0
            setIsConnected(false)
            setIsAuthenticated(false)
        }
    }, [])

    // Rejoindre une conversation
    const joinConversation = useCallback((conversationId: string) => {
        globalSocket?.emit('join_conversation', conversationId)
    }, [])

    // Quitter une conversation
    const leaveConversation = useCallback((conversationId: string) => {
        globalSocket?.emit('leave_conversation', conversationId)
    }, [])

    // Envoyer un message
    const sendMessage = useCallback((conversationId: string, content: string) => {
        if (!userIdRef.current || !globalSocket?.connected) {
            console.error('Cannot send message: not connected or not authenticated')
            return false
        }

        globalSocket.emit('send_message', {
            conversationId,
            content,
            senderId: userIdRef.current,
        })

        return true
    }, [])

    // Envoyer un indicateur de frappe
    const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
        globalSocket?.emit('typing', { conversationId, isTyping })
    }, [])

    // Marquer les messages comme lus
    const markAsRead = useCallback((conversationId: string) => {
        globalSocket?.emit('mark_read', { conversationId })
    }, [])

    // Auto-connect quand l'utilisateur est authentifié
    useEffect(() => {
        if (autoConnect && status === 'authenticated' && session?.user?.id) {
            userIdRef.current = session.user.id
            connectionCount++
            connect()
        }

        return () => {
            if (status === 'authenticated') {
                disconnect()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoConnect, status, session?.user?.id])

    return {
        socket: globalSocket,
        isConnected,
        isAuthenticated,
        connect,
        disconnect,
        joinConversation,
        leaveConversation,
        sendMessage,
        sendTypingIndicator,
        markAsRead,
    }
}
