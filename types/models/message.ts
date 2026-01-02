// ============================================
// Types liés à la Messagerie
// ============================================

import type { User } from './user'
import type { Ad } from './ad'

/**
 * Représentation d'un message
 */
export interface Message {
    id: string
    senderId: string
    receiverId: string
    adId?: string
    content: string
    timestamp: Date
    read: boolean
}

/**
 * Représentation d'une conversation
 */
export interface Conversation {
    id: string
    participants: User[]
    lastMessage: Message
    unreadCount: number
    ad?: Ad
}
