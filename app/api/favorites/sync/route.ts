import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FavoriteService } from '@/services'
import { rateLimit } from '@/lib/rate-limit'

// Limiteur : 10 syncs par heure par IP
const limiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 heure
    uniqueTokenPerInterval: 500, // Max 500 IPs suivies
})

/**
 * POST /api/favorites/sync
 * Synchronise les favoris locaux (visiteur) avec le compte utilisateur
 * 
 * Body: { adIds: string[] } - Liste des IDs d'annonces à synchroniser
 * 
 * Comportement :
 * - Fusionne les favoris locaux avec les favoris serveur
 * - Ignore les doublons (déjà en favoris)
 * - Ignore les annonces invalides (supprimées ou inexistantes)
 * - Retourne les favoris finaux après synchronisation
 */
export async function POST(request: NextRequest) {
    try {
        // Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'anonymous'
        try {
            await limiter.check(10, ip) // 10 syncs max par heure
        } catch {
            return NextResponse.json(
                { success: false, error: 'Trop de synchronisations. Veuillez réessayer plus tard.' },
                { status: 429 }
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
        console.error('Error syncing favorites:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la synchronisation des favoris'
            },
            { status: 500 }
        )
    }
}


