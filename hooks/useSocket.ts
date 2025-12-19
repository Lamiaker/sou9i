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

export function useSocket(options: UseSocketOptions = {}) {
    const { data: session, status } = useSession()
    const socketRef = useRef<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const {
        autoConnect = true,
        onNewMessage,
        onTyping,
        onNotification,
        onMessagesRead,
    } = options

    // Connexion au serveur Socket.IO
    const connect = useCallback(() => {
        if (socketRef.current?.connected) return

        const socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            autoConnect: false,
        })

        socket.on('connect', () => {
            setIsConnected(true)

            // Authentifier l'utilisateur
            if (session?.user?.id) {
                socket.emit('authenticate', session.user.id)
            }
        })

        socket.on('authenticated', () => {
            setIsAuthenticated(true)
        })

        socket.on('new_message', (message: SocketMessage) => {
            onNewMessage?.(message)
        })

        socket.on('user_typing', (event: TypingEvent) => {
            onTyping?.(event)
        })

        socket.on('notification', (event: NotificationEvent) => {
            onNotification?.(event)
        })

        socket.on('messages_read', (data: { conversationId: string; userId: string }) => {
            onMessagesRead?.(data)
        })

        socket.on('error', (error) => {
            console.error('❌ Socket erreur:', error)
        })

        socket.on('disconnect', () => {
            setIsConnected(false)
            setIsAuthenticated(false)
        })

        socket.connect()
        socketRef.current = socket
    }, [session?.user?.id, onNewMessage, onTyping, onNotification, onMessagesRead])

    // Déconnexion
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
            setIsConnected(false)
            setIsAuthenticated(false)
        }
    }, [])

    // Rejoindre une conversation
    const joinConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('join_conversation', conversationId)
    }, [])

    // Quitter une conversation
    const leaveConversation = useCallback((conversationId: string) => {
        socketRef.current?.emit('leave_conversation', conversationId)
    }, [])

    // Envoyer un message
    const sendMessage = useCallback((conversationId: string, content: string) => {
        if (!session?.user?.id || !socketRef.current?.connected) {
            console.error('Cannot send message: not connected or not authenticated')
            return false
        }

        socketRef.current.emit('send_message', {
            conversationId,
            content,
            senderId: session.user.id,
        })

        return true
    }, [session?.user?.id])

    // Envoyer un indicateur de frappe
    const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
        socketRef.current?.emit('typing', { conversationId, isTyping })
    }, [])

    // Marquer les messages comme lus
    const markAsRead = useCallback((conversationId: string) => {
        socketRef.current?.emit('mark_read', { conversationId })
    }, [])

    // Auto-connect quand l'utilisateur est authentifié
    useEffect(() => {
        if (autoConnect && status === 'authenticated' && session?.user?.id) {
            connect()
        }

        return () => {
            disconnect()
        }
    }, [autoConnect, status, session?.user?.id, connect, disconnect])

    // Returning ref.current is intentional for stable reference
    // eslint-disable-next-line react-hooks/refs
    return {
        socket: socketRef.current,
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
