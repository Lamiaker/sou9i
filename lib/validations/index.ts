/**
 * Point d'entrée centralisé pour tous les schémas de validation
 */

// Auth
export * from './auth'

// Annonces
export * from './ads'

// Messages
export * from './messages'

// Utilitaire de validation pour les routes API
import { z, ZodSchema } from 'zod'
import { NextResponse } from 'next/server'

/**
 * Valide les données d'une requête avec un schéma Zod
 * Retourne les données validées ou une réponse d'erreur formatée
 */
export async function validateRequest<T extends ZodSchema>(
    request: Request,
    schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
    try {
        const body = await request.json()
        const result = schema.safeParse(body)

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))

            return {
                success: false,
                response: NextResponse.json(
                    {
                        success: false,
                        error: 'Données invalides',
                        details: errors,
                    },
                    { status: 400 }
                ),
            }
        }

        return { success: true, data: result.data }
    } catch {
        return {
            success: false,
            response: NextResponse.json(
                {
                    success: false,
                    error: 'Corps de la requête invalide',
                },
                { status: 400 }
            ),
        }
    }
}

/**
 * Valide les paramètres de recherche (query string)
 */
export function validateSearchParams<T extends ZodSchema>(
    searchParams: URLSearchParams,
    schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
    // Convertir URLSearchParams en objet
    const params: Record<string, string | number> = {}

    searchParams.forEach((value, key) => {
        // Essayer de convertir en nombre si applicable
        const numValue = parseFloat(value)
        if (!isNaN(numValue) && isFinite(numValue)) {
            params[key] = numValue
        } else {
            params[key] = value
        }
    })

    const result = schema.safeParse(params)

    if (!result.success) {
        return {
            success: false,
            errors: result.error.issues.map((issue) => issue.message),
        }
    }

    return { success: true, data: result.data }
}
