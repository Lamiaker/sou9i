import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FavoriteService } from '@/services'
import { logServerError, getErrorMessage } from '@/lib/errors'
import { apiRateLimiter, getClientIP } from '@/lib/rate-limit-enhanced'

// GET /api/favorites - Récupérer les favoris d'un utilisateur
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const favorites = await FavoriteService.getUserFavorites(session.user.id)

        return NextResponse.json({
            success: true,
            data: favorites,
        })
    } catch (error) {
        logServerError(error, { route: '/api/favorites', action: 'get_favorites' })
        return NextResponse.json(
            { success: false, error: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

// POST /api/favorites - Ajouter aux favoris
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // ✅ RATE LIMITING
        const ip = getClientIP(request)
        const rateLimit = apiRateLimiter.check(ip)
        if (!rateLimit.success) {
            return NextResponse.json(
                { success: false, error: 'Trop de requêtes. Veuillez patienter.' },
                { status: 429 }
            )
        }

        const body = await request.json()
        const { adId } = body

        if (!adId) {
            return NextResponse.json(
                { success: false, error: 'adId requis' },
                { status: 400 }
            )
        }

        const favorite = await FavoriteService.addFavorite(session.user.id, adId)

        return NextResponse.json({
            success: true,
            data: favorite,
        }, { status: 201 })
    } catch (error: any) {
        if (error.message === 'Déjà en favoris' || error.message === 'Annonce non trouvée') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            )
        }

        logServerError(error, { route: '/api/favorites', action: 'add_favorite' })
        return NextResponse.json(
            { success: false, error: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

// DELETE /api/favorites - Retirer des favoris
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const adId = searchParams.get('adId')

        if (!adId) {
            return NextResponse.json(
                { success: false, error: 'adId requis' },
                { status: 400 }
            )
        }

        await FavoriteService.removeFavorite(session.user.id, adId)

        return NextResponse.json({
            success: true,
            message: 'Retiré des favoris',
        })
    } catch (error: any) {
        if (error.message === 'Favori non trouvé') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            )
        }

        logServerError(error, { route: '/api/favorites', action: 'remove_favorite' })
        return NextResponse.json(
            { success: false, error: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

