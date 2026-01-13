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
let isConnecting = false
let disconnectTimeout: NodeJS.Timeout | null = null

export function useSocket(options: UseSocketOptions = {}) {
    const { data: session, status } = useSession()
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const mountedRef = useRef(true)

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
        // Annuler toute déconnexion programmée
        if (disconnectTimeout) {
            clearTimeout(disconnectTimeout)
            disconnectTimeout = null
        }

        // Si déjà connecté, mettre à jour l'état
        if (globalSocket?.connected) {
            setIsConnected(true)
            setIsAuthenticated(true)
            return
        }

        // Si une connexion est en cours, attendre
        if (isConnecting) {
            return
        }

        // Si le socket existe mais pas connecté, reconnecter
        if (globalSocket) {
            globalSocket.connect()
            return
        }

        isConnecting = true

        const socket = io({
            path: '/api/socket',
            transports: ['websocket', 'polling'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
        })

        socket.on('connect', () => {
            console.log('✅ Socket.io connecté')
            isConnecting = false
            if (mountedRef.current) {
                setIsConnected(true)
            }

            // Authentifier l'utilisateur
            if (userIdRef.current) {
                socket.emit('authenticate', userIdRef.current)
            }
        })

        socket.on('authenticated', () => {
            console.log('✅ Socket.io authentifié')
            if (mountedRef.current) {
                setIsAuthenticated(true)
            }
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
            isConnecting = false
            if (mountedRef.current) {
                setIsConnected(false)
                setIsAuthenticated(false)
            }
        })

        socket.on('connect_error', (error) => {
            console.error('❌ Socket.io erreur de connexion:', error.message)
            isConnecting = false
        })

        socket.connect()
        globalSocket = socket
    }, [])

    // Déconnexion avec délai pour éviter les déconnexions prématurées
    const scheduleDisconnect = useCallback(() => {
        // Ne pas déconnecter immédiatement - attendre 5 secondes
        // Cela permet aux composants de se remonter sans perdre la connexion
        if (disconnectTimeout) {
            clearTimeout(disconnectTimeout)
        }

        disconnectTimeout = setTimeout(() => {
            if (globalSocket && !mountedRef.current) {
                console.log('🔌 Déconnexion Socket.io (après délai)')
                globalSocket.disconnect()
                globalSocket = null
                isConnecting = false
            }
        }, 5000) // 5 secondes de délai
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

    // Disconnect immédiat (pour usage manuel)
    const disconnect = useCallback(() => {
        if (disconnectTimeout) {
            clearTimeout(disconnectTimeout)
            disconnectTimeout = null
        }
        if (globalSocket) {
            globalSocket.disconnect()
            globalSocket = null
            isConnecting = false
            setIsConnected(false)
            setIsAuthenticated(false)
        }
    }, [])

    // Auto-connect quand l'utilisateur est authentifié
    useEffect(() => {
        mountedRef.current = true

        if (autoConnect && status === 'authenticated' && session?.user?.id) {
            userIdRef.current = session.user.id
            connect()
        }

        return () => {
            mountedRef.current = false
            // Ne pas déconnecter immédiatement, utiliser le délai
            scheduleDisconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoConnect, status, session?.user?.id])

    // Synchroniser l'état avec le socket global
    useEffect(() => {
        if (globalSocket?.connected) {
            setIsConnected(true)
        }
    }, [])

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
