import { NextRequest, NextResponse } from 'next/server'
import { AdService } from '@/services'

// GET /api/ads/[id] - Récupérer une annonce par ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Appel du service
        const ad = await AdService.getAdById(id)

        // Incrémenter les vues
        await AdService.incrementViews(id)

        return NextResponse.json({
            success: true,
            data: ad,
        })
    } catch (error) {
        console.error('Error fetching ad:', error)

        if (error instanceof Error && error.message === 'Annonce non trouvée') {
            return NextResponse.json(
                { success: false, error: 'Annonce non trouvée' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'annonce'
            },
            { status: 500 }
        )
    }
}

// PATCH /api/ads/[id] - Mettre à jour une annonce
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()

        // TODO: Récupérer l'utilisateur depuis la session
        // const session = await getServerSession()
        // if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        // const userId = session.user.id

        const userId = body.userId // Temporaire

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId requis' },
                { status: 400 }
            )
        }

        // Appel du service (qui vérifie la propriété)
        const ad = await AdService.updateAd(id, userId, {
            ...body,
            price: body.price ? parseFloat(body.price) : undefined,
        })

        return NextResponse.json({
            success: true,
            data: ad,
        })
    } catch (error) {
        console.error('Error updating ad:', error)

        if (error instanceof Error) {
            if (error.message === 'Annonce non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
            if (error.message === 'Non autorisé') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'annonce'
            },
            { status: 500 }
        )
    }
}

// DELETE /api/ads/[id] - Supprimer une annonce
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // TODO: Récupérer l'utilisateur depuis la session
        // const session = await getServerSession()
        // if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        // const userId = session.user.id

        const searchParams = request.nextUrl.searchParams
        const userId = searchParams.get('userId') // Temporaire

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId requis' },
                { status: 400 }
            )
        }

        // Appel du service (qui vérifie la propriété)
        await AdService.deleteAd(id, userId)

        return NextResponse.json({
            success: true,
            message: 'Annonce supprimée avec succès',
        })
    } catch (error) {
        console.error('Error deleting ad:', error)

        if (error instanceof Error) {
            if (error.message === 'Annonce non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
            if (error.message === 'Non autorisé') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'annonce'
            },
            { status: 500 }
        )
    }
}
