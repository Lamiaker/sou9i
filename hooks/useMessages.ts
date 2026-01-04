import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useSocket, SocketMessage } from './useSocket'

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
    onNewMessage?: (message: ConversationMessage) => void
}

export function useMessages(options: UseMessagesOptions = {}) {
    const { onNewMessage: onNewMessageCallback } = options
    const { data: session, status } = useSession()

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<ConversationMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [unreadTotal, setUnreadTotal] = useState(0)

    // --- TEMPS RÉEL (Socket.io) ---
    const {
        isConnected,
        isAuthenticated: isSocketAuthenticated,
        joinConversation,
        leaveConversation,
        sendTypingIndicator,
        markAsRead: emitMarkAsRead
    } = useSocket({
        onNewMessage: (socketMsg: SocketMessage) => {
            // Est-ce pour la conversation actuellement ouverte ?
            if (selectedConversation && socketMsg.conversationId === selectedConversation.id) {
                setMessages((prev) => {
                    // Éviter les doublons
                    if (prev.find(m => m.id === socketMsg.id)) return prev;
                    return [...prev, socketMsg];
                });

                // Si on a la fenêtre ouverte, on marque comme lu
                if (socketMsg.senderId !== session?.user?.id) {
                    emitMarkAsRead(socketMsg.conversationId);
                }
            }

            // Mettre à jour la liste des conversations (dernier message et compteur)
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.id === socketMsg.conversationId) {
                        const isCurrent = selectedConversation?.id === conv.id;
                        return {
                            ...conv,
                            lastMessage: socketMsg,
                            updatedAt: socketMsg.createdAt,
                            unreadCount: isCurrent ? 0 : (conv.unreadCount || 0) + 1
                        };
                    }
                    return conv;
                }).sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
            );

            onNewMessageCallback?.(socketMsg);
        },
        onMessagesRead: ({ conversationId, userId }) => {
            if (userId !== session?.user?.id) {
                // L'autre personne a lu mes messages
                if (selectedConversation?.id === conversationId) {
                    setMessages(prev => prev.map(m => ({ ...m, read: true })));
                }
            }
        }
    });

    // Charger les conversations
    const fetchConversations = useCallback(async (silent = false) => {
        if (status !== 'authenticated') return

        try {
            if (!silent) setIsLoading(true)
            const response = await fetch('/api/messages/conversations')
            if (!response.ok) throw new Error('Erreur réseau')
            const data = await response.json()

            if (data.success) {
                setConversations(data.data)
                const total = data.data.reduce((acc: number, conv: Conversation) =>
                    acc + (conv.unreadCount || 0), 0)
                setUnreadTotal(total)
            } else {
                throw new Error(data.error)
            }
        } catch (err: any) {
            if (!silent) setError(err.message || 'Erreur lors du chargement des conversations')
        } finally {
            if (!silent) setIsLoading(false)
        }
    }, [status])

    // Charger les messages d'une conversation (uniquement au clic/sélection)
    const fetchMessages = useCallback(async (conversationId: string) => {
        try {
            const response = await fetch(`/api/messages/conversations/${conversationId}`)
            if (!response.ok) throw new Error('Erreur réseau')
            const data = await response.json()

            if (data.success) {
                setMessages(data.data.messages || [])
                setSelectedConversation(data.data)

                // Rejoindre la room socket
                joinConversation(conversationId);

                // Marquer comme lu
                setConversations(prev =>
                    prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
                )

                return data.data
            }
        } catch (err: any) {
            setError(err.message || 'Erreur lors du chargement de la conversation')
        }
        return null
    }, [joinConversation])

    // Sélectionner une conversation
    const selectConversation = useCallback(async (conversationId: string | null) => {
        if (selectedConversation?.id) {
            leaveConversation(selectedConversation.id);
        }

        if (conversationId) {
            await fetchMessages(conversationId)
        } else {
            setSelectedConversation(null)
            setMessages([])
        }
    }, [selectedConversation?.id, fetchMessages, leaveConversation])

    // Envoyer un message (via REST pour sécurité/validation, Socket pour le temps réel)
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
                // Le message sera aussi reçu via Socket.io (broadcast de lib/socket.ts)
                // mais on l'ajoute localement pour une UX immédiate
                if (!messages.find(m => m.id === data.data.id)) {
                    setMessages((prev) => [...prev, data.data])
                }
                return true
            }
            return false
        } catch (err) {
            console.error('Erreur envoi message:', err)
            return false
        }
    }, [selectedConversation?.id, messages])

    // Créer ou récupérer une conversation
    const startConversation = useCallback(async (recipientId: string, adTitle?: string, adId?: string) => {
        try {
            const response = await fetch('/api/messages/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId, adTitle, adId }),
            })
            const data = await response.json()

            if (data.success) {
                setConversations((prev) => {
                    const exists = prev.find((c) => c.id === data.data.id)
                    return exists ? prev : [data.data, ...prev];
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

    // Initialisation
    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations()
        }
    }, [status, fetchConversations])

    // Obtenir l'autre participant
    const getOtherParticipant = useCallback((conversation: Conversation) => {
        if (!session?.user?.id) return null
        return conversation.participants.find((p) => p.id !== session.user.id) || null
    }, [session?.user?.id])

    return {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        error,
        unreadTotal,
        isConnected,
        isAuthenticated: isSocketAuthenticated,
        fetchConversations,
        selectConversation,
        sendMessage,
        startConversation,
        sendTypingIndicator: (isTyping: boolean) => {
            if (selectedConversation?.id) sendTypingIndicator(selectedConversation.id, isTyping);
        },
        markAsRead: () => {
            if (selectedConversation?.id) emitMarkAsRead(selectedConversation.id);
        },
        getOtherParticipant,
        currentUserId: session?.user?.id,
    }
}
