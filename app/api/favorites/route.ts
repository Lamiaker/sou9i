import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { FavoriteService } from '@/services'

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

        // Appel du service avec l'ID de la session (sécurisé)
        const favorites = await FavoriteService.getUserFavorites(session.user.id)

        return NextResponse.json({
            success: true,
            data: favorites,
        })
    } catch (error) {
        console.error('Error fetching favorites:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération des favoris'
            },
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

        const body = await request.json()
        const { adId } = body

        if (!adId) {
            return NextResponse.json(
                { success: false, error: 'adId requis' },
                { status: 400 }
            )
        }

        // Appel du service avec l'ID de la session (sécurisé)
        const favorite = await FavoriteService.addFavorite(session.user.id, adId)

        return NextResponse.json({
            success: true,
            data: favorite,
        }, { status: 201 })
    } catch (error) {
        console.error('Error adding favorite:', error)

        if (error instanceof Error) {
            if (error.message === 'Déjà en favoris' || error.message === 'Annonce non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 400 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout aux favoris'
            },
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

        // Appel du service avec l'ID de la session (sécurisé)
        await FavoriteService.removeFavorite(session.user.id, adId)

        return NextResponse.json({
            success: true,
            message: 'Retiré des favoris',
        })
    } catch (error) {
        console.error('Error removing favorite:', error)

        if (error instanceof Error && error.message === 'Favori non trouvé') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors du retrait des favoris'
            },
            { status: 500 }
        )
    }
}
