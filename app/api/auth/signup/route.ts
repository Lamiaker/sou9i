import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'
import { registerSchema } from '@/lib/validations/auth'
import { checkSignupRateLimit, resetSignupRateLimit, getClientIP } from '@/lib/rate-limit-hybrid'
import { logServerError, ConflictError, ValidationError } from '@/lib/errors'
import { errorResponse } from '@/lib/api-utils'
import { verifyTurnstileToken } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limiting hybride (Redis avec fallback mémoire)
        const ip = getClientIP(request)
        const body = await request.json()

        // 0. Vérification CAPTCHA en production
        if (process.env.NODE_ENV === 'production') {
            if (!body.captchaToken) {
                return NextResponse.json(
                    { success: false, error: 'CAPTCHA requis' },
                    { status: 400 }
                )
            }
            const captchaResult = await verifyTurnstileToken(body.captchaToken, ip)
            if (!captchaResult.success) {
                return NextResponse.json(
                    { success: false, error: captchaResult.error || 'Échec de la vérification CAPTCHA' },
                    { status: 400 }
                )
            }
        }

        // 1. Rate Limiting hybride (Redis avec fallback mémoire)
        const rateLimitResult = await checkSignupRateLimit(ip)

        if (!rateLimitResult.success) {
            // Ajouter les headers de rate limit
            const response = NextResponse.json(
                {
                    success: false,
                    error: rateLimitResult.blocked
                        ? 'Compte temporairement bloqué. Veuillez réessayer plus tard.'
                        : 'Trop de tentatives. Veuillez réessayer plus tard.',
                    retryAfter: rateLimitResult.retryAfter,
                },
                { status: 429 }
            )
            response.headers.set('Retry-After', String(rateLimitResult.retryAfter || 60))
            response.headers.set('X-RateLimit-Remaining', '0')
            response.headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString())
            return response
        }

        // const body = await request.json() // Deja fait au dessus

        // 2. Validation Zod
        if (body.phone) {
            body.phone = body.phone.replace(/\s/g, "");
        }
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

        // Succès - réinitialiser le rate limit pour cette IP
        await resetSignupRateLimit(ip)

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
