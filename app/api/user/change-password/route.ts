import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services'
import { prisma } from '@/lib/prisma'
import { logServerError, ERROR_MESSAGES } from '@/lib/errors'
import { checkChangePasswordRateLimit, getClientIP } from '@/lib/rate-limit-hybrid'

export async function POST(request: NextRequest) {
    try {
        // ✅ RATE LIMITING HYBRIDE
        const ip = getClientIP(request)
        const rateLimitResult = await checkChangePasswordRateLimit(ip)
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Trop de tentatives. Veuillez réessayer plus tard.',
                    retryAfter: rateLimitResult.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 60),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                    }
                }
            )
        }

        // Vérifier l'authentification
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Mot de passe actuel et nouveau mot de passe requis' },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        // Vérifier le mot de passe actuel
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                password: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            )
        }

        // Vérifier que l'utilisateur a un mot de passe (compte credentials)
        if (!user.password) {
            return NextResponse.json(
                { error: 'Impossible de changer le mot de passe pour ce type de compte' },
                { status: 400 }
            )
        }

        const isValidPassword = await UserService.verifyPassword(
            currentPassword,
            user.password
        )

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Mot de passe actuel incorrect' },
                { status: 400 }
            )
        }

        // Changer le mot de passe
        await UserService.updatePassword(session.user.id, newPassword)

        return NextResponse.json(
            { message: 'Mot de passe mis à jour avec succès' },
            { status: 200 }
        )
    } catch (error) {
        logServerError(error, { route: '/api/user/change-password', action: 'change_password' })
        return NextResponse.json(
            { error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}


