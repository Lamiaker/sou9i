import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FavoriteService } from '@/services'
import { checkApiRateLimit, getClientIP } from '@/lib/rate-limit-hybrid'
import { logServerError, ERROR_MESSAGES } from '@/lib/errors'


export async function POST(request: NextRequest) {
    try {
        // Rate Limiting Hybride
        const ip = getClientIP(request)
        const rateLimitResult = await checkApiRateLimit(ip)
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Trop de synchronisations. Veuillez réessayer plus tard.',
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

        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { adIds } = body

        // Validation des données entrantes
        if (!adIds || !Array.isArray(adIds)) {
            return NextResponse.json(
                { success: false, error: 'adIds doit être un tableau' },
                { status: 400 }
            )
        }

        // Limite de sécurité : max 100 favoris à synchroniser à la fois
        if (adIds.length > 100) {
            return NextResponse.json(
                { success: false, error: 'Maximum 100 favoris à synchroniser' },
                { status: 400 }
            )
        }

        // Validation du format des IDs (CUID)
        const validIdFormat = /^[a-z0-9]{25}$/i
        const validAdIds = adIds.filter((id: unknown) =>
            typeof id === 'string' && validIdFormat.test(id)
        )

        if (validAdIds.length === 0 && adIds.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Aucun ID valide fourni' },
                { status: 400 }
            )
        }

        // Appel du service de synchronisation
        const result = await FavoriteService.syncFavorites(session.user.id, validAdIds)

        return NextResponse.json({
            success: true,
            data: result,
            message: `${result.added} favoris ajoutés, ${result.skipped} ignorés (doublons ou invalides)`
        })
    } catch (error) {
        logServerError(error, { route: '/api/favorites/sync', action: 'sync_favorites' });
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.GENERIC
            },
            { status: 500 }
        )
    }
}


