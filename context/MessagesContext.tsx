'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useSocket, SocketMessage } from '@/hooks/useSocket'
import { useToast } from '@/components/ui/Toast'

export interface MessageUser {
    id: string
    name: string | null
    avatar: string | null
    email: string
}

export interface Message {
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
    participants: MessageUser[]
    lastMessage?: Message
    unreadCount: number
    _count: {
        messages: number
    }
}

interface MessagesContextType {
    conversations: Conversation[]
    unreadTotal: number
    isLoading: boolean
    refreshConversations: () => Promise<void>
    markAsRead: (conversationId: string) => void
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export function MessagesProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const pathname = usePathname()
    const { info } = useToast()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [unreadTotal, setUnreadTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Charger les conversations initiales
    const fetchConversations = useCallback(async () => {
        if (status !== 'authenticated' || !session?.user?.id) return

        try {
            setIsLoading(true)
            const response = await fetch('/api/messages/conversations')
            const data = await response.json()

            if (data.success) {
                setConversations(data.data)
                const total = data.data.reduce((acc: number, conv: Conversation) =>
                    acc + (conv.unreadCount || 0), 0)
                setUnreadTotal(total)
            }
        } catch (err) {
            console.error('Erreur chargement messages:', err)
        } finally {
            setIsLoading(false)
        }
    }, [status, session?.user?.id])

    // Configuration du socket global
    useSocket({
        onNewMessage: (socketMsg: SocketMessage) => {
            // Uniquement si le message vient de quelqu'un d'autre
            if (socketMsg.senderId !== session?.user?.id) {
                // Afficher un toast si on n'est pas déjà dans cette conversation spécifique
                // On vérifie si on est sur la page de cette conversation
                const isCurrentConvPage = pathname === `/dashboard/messages/${socketMsg.conversationId}`

                if (!isCurrentConvPage) {
                    info(`Nouveau message de ${socketMsg.sender.name || 'un utilisateur'}`)
                }
            }

            setConversations((prev) => {
                const updated = prev.map((conv) => {
                    if (conv.id === socketMsg.conversationId) {
                        return {
                            ...conv,
                            lastMessage: socketMsg,
                            updatedAt: socketMsg.createdAt,
                            unreadCount: (conv.unreadCount || 0) + 1
                        }
                    }
                    return conv
                }).sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )

                // Si la conversation n'est pas dans la liste, on rafraîchit tout
                if (!prev.find(c => c.id === socketMsg.conversationId)) {
                    fetchConversations()
                    return prev
                }

                // Mettre à jour le total global
                const newTotal = updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0)
                setUnreadTotal(newTotal)

                return updated
            })
        },
        onMessagesRead: ({ conversationId, userId }) => {
            if (userId === session?.user?.id) {
                // Si c'est moi qui ai lu, on reset le compteur local
                setConversations(prev => {
                    const updated = prev.map(c =>
                        c.id === conversationId ? { ...c, unreadCount: 0 } : c
                    )
                    setUnreadTotal(updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0))
                    return updated
                })
            }
        }
    })

    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations()
        } else {
            setConversations([])
            setUnreadTotal(0)
        }
    }, [status, fetchConversations])

    const markAsRead = async (conversationId: string) => {
        // Mise à jour locale immédiate (Optimistic UI)
        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            )
            setUnreadTotal(updated.reduce((acc, c) => acc + (c.unreadCount || 0), 0))
            return updated
        })

        // Appel API pour synchroniser la DB
        try {
            await fetch('/api/messages/read', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId }),
            })
        } catch (error) {
            console.error('Erreur markAsRead API:', error)
        }
    }

    return (
        <MessagesContext.Provider value={{
            conversations,
            unreadTotal,
            isLoading,
            refreshConversations: fetchConversations,
            markAsRead
        }}>
            {children}
        </MessagesContext.Provider>
    )
}

export function useGlobalMessages() {
    const context = useContext(MessagesContext)
    if (context === undefined) {
        throw new Error('useGlobalMessages must be used within a MessagesProvider')
    }
    return context
}
