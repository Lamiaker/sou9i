'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

// Types
export interface ConversationUser {
    id: string
    name: string | null
    avatar: string | null
    email: string
}

export interface ConversationMessage {
    id: string
    content: string
    read: boolean
    createdAt: Date | string
    senderId: string
    sender: {
        id: string
        name: string | null
        avatar: string | null
    }
}

export interface Conversation {
    id: string
    adTitle: string | null
    adId: string | null
    createdAt: Date | string
    updatedAt: Date | string
    participants: ConversationUser[]
    messages: ConversationMessage[]
    lastMessage?: ConversationMessage
    unreadCount: number
    _count: {
        messages: number
    }
}

interface UseMessagesOptions {
    pollingInterval?: number // Intervalle de polling en ms (défaut: 3000)
    onNewMessage?: (message: ConversationMessage) => void
}

export function useMessages(options: UseMessagesOptions = {}) {
    const { pollingInterval = 3000, onNewMessage } = options
    const { data: session, status } = useSession()

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [unreadTotal, setUnreadTotal] = useState(0)

    // Refs pour le polling
    const lastMessageIdRef = useRef<string | null>(null)
    const pollingRef = useRef<NodeJS.Timeout | null>(null)
    const isPollingActiveRef = useRef(false)

    // Charger les conversations
    const fetchConversations = useCallback(async (silent = false) => {
        if (status !== 'authenticated') return

        try {
            if (!silent) setIsLoading(true)
            const response = await fetch('/api/messages/conversations')
            const data = await response.json()

            if (data.success) {
                setConversations(data.data)
                const total = data.data.reduce((acc: number, conv: Conversation) =>
                    acc + (conv.unreadCount || 0), 0)
                setUnreadTotal(total)
            } else {
                if (!silent) setError(data.error)
            }
        } catch (err) {
            if (!silent) {
                setError('Erreur lors du chargement des conversations')
                console.error(err)
            }
        } finally {
            if (!silent) setIsLoading(false)
        }
    }, [status])

    // Charger les messages d'une conversation
    const fetchMessages = useCallback(async (conversationId: string, silent = false) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}`)
            const data = await response.json()

            if (data.success) {
                const newMessages: ConversationMessage[] = data.data.messages || []

                // Vérifier s'il y a de nouveaux messages
                if (newMessages.length > 0) {
                    const lastNewMessage = newMessages[newMessages.length - 1]

                    // Si c'est un nouveau message, notifier
                    if (lastMessageIdRef.current && lastNewMessage.id !== lastMessageIdRef.current) {
                        const lastKnownIndex = newMessages.findIndex(m => m.id === lastMessageIdRef.current)
                        if (lastKnownIndex !== -1) {
                            // Notifier pour chaque nouveau message
                            for (let i = lastKnownIndex + 1; i < newMessages.length; i++) {
                                onNewMessage?.(newMessages[i])
                            }
                        }
                    }

                    lastMessageIdRef.current = lastNewMessage.id
                }

                if (!silent) {
                    setSelectedConversation(data.data)
                }
                setMessages(newMessages)

                // Réinitialiser le compteur de non-lus pour cette conversation
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    )
                )

                return data.data
            } else {
                if (!silent) setError(data.error)
            }
        } catch (err) {
            if (!silent) {
                setError('Erreur lors du chargement de la conversation')
                console.error(err)
            }
        }
        return null
    }, [onNewMessage])

    // Démarrer le polling pour une conversation
    const startPolling = useCallback((conversationId: string) => {
        // Arrêter le polling existant
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
        }

        isPollingActiveRef.current = true

        // Démarrer le nouveau polling
        pollingRef.current = setInterval(async () => {
            if (isPollingActiveRef.current) {
                await fetchMessages(conversationId, true)
                await fetchConversations(true)
            }
        }, pollingInterval)

    }, [pollingInterval, fetchMessages, fetchConversations])

    // Arrêter le polling
    const stopPolling = useCallback(() => {
        isPollingActiveRef.current = false
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }, [])

    // Sélectionner une conversation
    const selectConversation = useCallback(async (conversationId: string | null) => {
        // Arrêter le polling de l'ancienne conversation
        stopPolling()
        lastMessageIdRef.current = null

        if (conversationId) {
            const conv = await fetchMessages(conversationId)
            if (conv) {
                setSelectedConversation(conv)
                // Démarrer le polling pour la nouvelle conversation
                startPolling(conversationId)
            }
        } else {
            setSelectedConversation(null)
            setMessages([])
        }
    }, [fetchMessages, stopPolling, startPolling])

    // Envoyer un message
    const sendMessage = useCallback(async (content: string) => {
        if (!selectedConversation?.id || !content.trim()) return false

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: selectedConversation.id,
                    content,
                }),
            })
            const data = await response.json()

            if (data.success) {
                // Ajouter le message immédiatement à la liste locale
                setMessages((prev) => [...prev, data.data])
                lastMessageIdRef.current = data.data.id

                // Mettre à jour la conversation dans la liste
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === selectedConversation.id
                            ? {
                                ...conv,
                                lastMessage: data.data,
                                updatedAt: data.data.createdAt,
                            }
                            : conv
                    ).sort((a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                    )
                )

                return true
            }
            return false
        } catch (err) {
            console.error('Erreur envoi message:', err)
            return false
        }
    }, [selectedConversation?.id])

    // Créer ou récupérer une conversation
    const startConversation = useCallback(async (
        recipientId: string,
        adTitle?: string,
        adId?: string
    ) => {
        try {
            const response = await fetch('/api/messages/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId, adTitle, adId }),
            })
            const data = await response.json()

            if (data.success) {
                // Ajouter la conversation à la liste si elle n'existe pas
                setConversations((prev) => {
                    const exists = prev.find((c) => c.id === data.data.id)
                    if (!exists) {
                        return [data.data, ...prev]
                    }
                    return prev
                })
                await selectConversation(data.data.id)
                return data.data
            }
            return null
        } catch (err) {
            console.error('Erreur création conversation:', err)
            return null
        }
    }, [selectConversation])

    // Charger les conversations au démarrage
    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations()
        }
    }, [status, fetchConversations])

    // Polling global pour les nouvelles conversations (moins fréquent)
    useEffect(() => {
        if (status !== 'authenticated') return

        const globalPolling = setInterval(() => {
            fetchConversations(true)
        }, 10000) // Rafraîchir la liste toutes les 10 secondes

        return () => clearInterval(globalPolling)
    }, [status, fetchConversations])

    // Nettoyage au démontage
    useEffect(() => {
        return () => {
            stopPolling()
        }
    }, [stopPolling])

    // Obtenir l'autre participant (pour l'affichage)
    const getOtherParticipant = useCallback((conversation: Conversation) => {
        if (!session?.user?.id) return null
        return conversation.participants.find((p) => p.id !== session.user.id) || null
    }, [session?.user?.id])

    return {
        // État
        conversations,
        selectedConversation,
        messages,
        isLoading,
        error,
        unreadTotal,
        isConnected: true, // Toujours "connecté" avec le polling
        isAuthenticated: status === 'authenticated',

        // Actions
        fetchConversations,
        selectConversation,
        sendMessage,
        startConversation,

        // Ces fonctions sont des no-op sans WebSocket mais gardées pour compatibilité
        sendTypingIndicator: (_isTyping: boolean) => { },
        markAsRead: () => { },

        // Helpers
        getOtherParticipant,
        currentUserId: session?.user?.id,
    }
}
