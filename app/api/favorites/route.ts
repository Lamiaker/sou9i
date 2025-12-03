import { NextRequest, NextResponse } from 'next/server'
import { FavoriteService } from '@/services'

// GET /api/favorites - Récupérer les favoris d'un utilisateur
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId requis' },
                { status: 400 }
            )
        }

        // Appel du service
        const favorites = await FavoriteService.getUserFavorites(userId)

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
        const body = await request.json()
        const { userId, adId } = body

        if (!userId || !adId) {
            return NextResponse.json(
                { success: false, error: 'userId et adId requis' },
                { status: 400 }
            )
        }

        // Appel du service
        const favorite = await FavoriteService.addFavorite(userId, adId)

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
        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId')
        const adId = searchParams.get('adId')

        if (!userId || !adId) {
            return NextResponse.json(
                { success: false, error: 'userId et adId requis' },
                { status: 400 }
            )
        }

        // Appel du service
        await FavoriteService.removeFavorite(userId, adId)

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
