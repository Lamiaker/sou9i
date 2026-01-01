import { z } from "zod"

/**
 * Constantes de validation pour les messages
 */
export const MESSAGE_VALIDATION = {
    CONTENT_MIN: 1,
    CONTENT_MAX: 2000,
}

/**
 * Schéma de validation pour l'envoi d'un message
 */
export const sendMessageSchema = z.object({
    conversationId: z.string()
        .min(1, { message: "ID de conversation requis" })
        .regex(/^c[a-z0-9]{24,}$/i, { message: "ID de conversation invalide" }),

    content: z.string()
        .min(MESSAGE_VALIDATION.CONTENT_MIN, { message: "Le message ne peut pas être vide" })
        .max(MESSAGE_VALIDATION.CONTENT_MAX, { message: `Le message ne peut pas dépasser ${MESSAGE_VALIDATION.CONTENT_MAX} caractères` })
        .trim()
        .refine((val) => val.length > 0, { message: "Le message ne peut pas être vide" }),
})

/**
 * Schéma de validation pour créer une conversation
 */
export const createConversationSchema = z.object({
    recipientId: z.string()
        .min(1, { message: "ID du destinataire requis" })
        .regex(/^c[a-z0-9]{24,}$/i, { message: "ID du destinataire invalide" }),

    adTitle: z.string()
        .max(100)
        .optional(),

    adId: z.string()
        .regex(/^c[a-z0-9]{24,}$/i, { message: "ID d'annonce invalide" })
        .optional(),
})

/**
 * Schéma pour les paramètres de pagination des messages
 */
export const getMessagesSchema = z.object({
    conversationId: z.string().regex(/^c[a-z0-9]{24,}$/i, { message: "ID de conversation invalide" }),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(50),
})

// Types exportés
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
export type GetMessagesInput = z.infer<typeof getMessagesSchema>
