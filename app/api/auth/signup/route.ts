import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'
import { registerSchema } from '@/lib/validations/auth'
import { rateLimit } from '@/lib/rate-limit'
import { logServerError, ConflictError, RateLimitError, ValidationError } from '@/lib/errors'
import { errorResponse } from '@/lib/api-utils'

// Limiteur : 5 tentatives par heure par IP
const limiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 heure
    uniqueTokenPerInterval: 500, // Max 500 IPs suivies
})

export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous'
        try {
            await limiter.check(5, ip) // 5 requêtes max par heure
        } catch {
            throw new RateLimitError()
        }

        const body = await request.json()

        // 2. Validation Zod
        const parsedBody = registerSchema.safeParse(body)

        if (!parsedBody.success) {
            // Retourner la première erreur trouvée
            throw new ValidationError(parsedBody.error.issues[0].message)
        }

        const { email, name, password, phone, city } = parsedBody.data

        // 3. Créer l'utilisateur
        const user = await UserService.createUser({
            email,
            name,
            password,
            phone: phone.replace(/\s/g, ''), // Enlever les espaces
            city,
        })

        return NextResponse.json(
            {
                success: true,
                message: 'Compte créé avec succès',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        // Email déjà utilisé - erreur attendue
        if (error instanceof Error && error.message === 'Cet email est déjà utilisé') {
            return errorResponse(new ConflictError(error.message), { route: '/api/auth/signup' })
        }

        // Autres erreurs
        logServerError(error, { route: '/api/auth/signup', action: 'create_user' })
        return errorResponse(error, { route: '/api/auth/signup' })
    }
}
