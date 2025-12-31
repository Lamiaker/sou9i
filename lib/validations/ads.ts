import { z } from "zod"

/**
 * Constantes de validation pour les annonces
 */
export const AD_VALIDATION = {
    TITLE_MIN: 5,
    TITLE_MAX: 100,
    DESCRIPTION_MIN: 20,
    DESCRIPTION_MAX: 5000,
    PRICE_MIN: 0,
    PRICE_MAX: 999_999_999, // ~1 milliard DZD max
    LOCATION_MIN: 2,
    LOCATION_MAX: 100,
    IMAGES_MAX: 5,
    PHONE_PATTERN: /^(0|\+213)[5-7][0-9]{8}$|^[0-9\s\-+]{8,15}$/,
}

/**
 * Schéma de validation pour la création d'une annonce
 */
export const createAdSchema = z.object({
    title: z.string()
        .min(AD_VALIDATION.TITLE_MIN, { message: `Le titre doit contenir au moins ${AD_VALIDATION.TITLE_MIN} caractères` })
        .max(AD_VALIDATION.TITLE_MAX, { message: `Le titre ne peut pas dépasser ${AD_VALIDATION.TITLE_MAX} caractères` })
        .trim(),

    description: z.string()
        .min(AD_VALIDATION.DESCRIPTION_MIN, { message: `La description doit contenir au moins ${AD_VALIDATION.DESCRIPTION_MIN} caractères` })
        .max(AD_VALIDATION.DESCRIPTION_MAX, { message: `La description ne peut pas dépasser ${AD_VALIDATION.DESCRIPTION_MAX} caractères` })
        .trim(),

    price: z.number()
        .min(AD_VALIDATION.PRICE_MIN, { message: "Le prix ne peut pas être négatif" })
        .max(AD_VALIDATION.PRICE_MAX, { message: "Le prix est trop élevé" })
        .or(z.string().transform((val) => {
            const num = parseFloat(val)
            if (isNaN(num)) throw new Error("Prix invalide")
            return num
        })),

    categoryId: z.string()
        .min(1, { message: "La catégorie est requise" })
        .uuid({ message: "ID de catégorie invalide" }),

    location: z.string()
        .min(AD_VALIDATION.LOCATION_MIN, { message: "La localisation est requise" })
        .max(AD_VALIDATION.LOCATION_MAX, { message: `La localisation ne peut pas dépasser ${AD_VALIDATION.LOCATION_MAX} caractères` })
        .trim(),

    contactPhone: z.string()
        .regex(AD_VALIDATION.PHONE_PATTERN, { message: "Numéro de téléphone invalide" })
        .nullable()
        .optional(),

    images: z.array(z.string().url({ message: "URL d'image invalide" }))
        .max(AD_VALIDATION.IMAGES_MAX, { message: `Maximum ${AD_VALIDATION.IMAGES_MAX} images autorisées` })
        .optional()
        .default([]),

    // Champs optionnels
    condition: z.string().optional(),
    brand: z.string().max(50).optional(),
    size: z.string().max(20).optional(),
    deliveryAvailable: z.boolean().optional().default(false),
    negotiable: z.boolean().optional().default(false),

    // Champs dynamiques
    dynamicFields: z.array(z.object({
        fieldId: z.string().uuid({ message: "ID de champ invalide" }),
        value: z.string().max(500, { message: "Valeur trop longue" }),
    })).optional().default([]),
})

/**
 * Schéma de validation pour la mise à jour d'une annonce
 */
export const updateAdSchema = z.object({
    title: z.string()
        .min(AD_VALIDATION.TITLE_MIN)
        .max(AD_VALIDATION.TITLE_MAX)
        .trim()
        .optional(),

    description: z.string()
        .min(AD_VALIDATION.DESCRIPTION_MIN)
        .max(AD_VALIDATION.DESCRIPTION_MAX)
        .trim()
        .optional(),

    price: z.number()
        .min(AD_VALIDATION.PRICE_MIN)
        .max(AD_VALIDATION.PRICE_MAX)
        .optional(),

    location: z.string()
        .min(AD_VALIDATION.LOCATION_MIN)
        .max(AD_VALIDATION.LOCATION_MAX)
        .trim()
        .optional(),

    status: z.enum(['active', 'sold', 'archived']).optional(),

    images: z.array(z.string().url())
        .max(AD_VALIDATION.IMAGES_MAX)
        .optional(),

    condition: z.string().optional(),
    brand: z.string().max(50).optional(),
    size: z.string().max(20).optional(),
    deliveryAvailable: z.boolean().optional(),
    negotiable: z.boolean().optional(),
})

/**
 * Schéma pour les filtres de recherche d'annonces
 */
export const adFiltersSchema = z.object({
    categoryId: z.string().uuid().optional(),
    subcategoryId: z.string().uuid().optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().max(AD_VALIDATION.PRICE_MAX).optional(),
    location: z.string().max(100).optional(),
    condition: z.string().optional(),
    search: z.string().max(200).optional(),
    status: z.enum(['active', 'sold', 'archived', 'pending']).optional(),
    userId: z.string().uuid().optional(),
    moderationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(12),
})

// Types exportés
export type CreateAdInput = z.infer<typeof createAdSchema>
export type UpdateAdInput = z.infer<typeof updateAdSchema>
export type AdFiltersInput = z.infer<typeof adFiltersSchema>
