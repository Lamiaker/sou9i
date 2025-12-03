import { Prisma } from '@prisma/client'

// Type pour User avec ses relations
export type UserWithRelations = Prisma.UserGetPayload<{
    include: {
        ads: true
        favorites: true
    }
}>

// Type pour Ad avec ses relations
export type AdWithRelations = Prisma.AdGetPayload<{
    include: {
        user: {
            select: {
                id: true
                name: true
                avatar: true
                city: true
                isVerified: true
            }
        }
        category: true
        favorites: true
    }
}>

// Type pour Conversation avec messages
export type ConversationWithMessages = Prisma.ConversationGetPayload<{
    include: {
        participants: {
            select: {
                id: true
                name: true
                avatar: true
            }
        }
        messages: {
            include: {
                sender: {
                    select: {
                        id: true
                        name: true
                        avatar: true
                    }
                }
            }
            orderBy: {
                createdAt: 'desc'
            }
        }
    }
}>

// Type pour les inputs de création
export type CreateAdInput = Omit<Prisma.AdCreateInput, 'user' | 'category'> & {
    userId: string
    categoryId: string
}

export type CreateUserInput = Prisma.UserCreateInput

export type UpdateAdInput = Partial<Omit<Prisma.AdUpdateInput, 'user' | 'category'>>

// Type pour les filtres de recherche
export type AdFilters = {
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    location?: string
    condition?: string
    search?: string
    userId?: string
    status?: string
}
