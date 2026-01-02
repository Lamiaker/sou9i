// ============================================
// DTOs pour la Messagerie
// ============================================

/**
 * DTO pour la création d'un message
 */
export interface CreateMessageDTO {
    conversationId: string
    senderId: string
    content: string
}

/**
 * DTO pour la création d'une conversation
 */
export interface CreateConversationDTO {
    participantIds: string[]
    adId?: string
    adTitle?: string
    initialMessage?: string
}

/**
 * Interface pour une conversation avec ses détails
 */
export interface ConversationWithDetailsDTO {
    id: string
    adTitle: string | null
    adId: string | null
    createdAt: Date
    updatedAt: Date
    participants: {
        id: string
        name: string | null
        avatar: string | null
    }[]
    messages: {
        id: string
        content: string
        read: boolean
        createdAt: Date
        sender: {
            id: string
            name: string | null
            avatar: string | null
        }
    }[]
    _count: {
        messages: number
    }
}
