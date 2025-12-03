import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'
import { registerSchema } from '@/lib/validations/auth'
import { rateLimit } from '@/lib/rate-limit'

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
            return NextResponse.json(
                { success: false, error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
                { status: 429 }
            )
        }

        const body = await request.json()

        // 2. Validation Zod
        const parsedBody = registerSchema.safeParse(body)

        if (!parsedBody.success) {
            // Retourner la première erreur trouvée
            return NextResponse.json(
                { success: false, error: parsedBody.error.issues[0].message },
                { status: 400 }
            )
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
        console.error('Error during signup:', error)

        if (error instanceof Error) {
            if (error.message === 'Cet email est déjà utilisé') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            { success: false, error: 'Une erreur est survenue lors de l\'inscription' },
            { status: 500 }
        )
    }
}
