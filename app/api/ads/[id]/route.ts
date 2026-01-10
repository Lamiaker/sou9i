import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdService } from '@/services'
import { deleteUnusedImages } from '@/lib/deleteImages'
import { logServerError, AuthenticationError, ForbiddenError, ERROR_MESSAGES, ValidationError } from '@/lib/errors'
import { errorResponse } from '@/lib/api-utils'
import { updateAdSchema } from '@/lib/validations/ads'
import { revalidateAdsPages } from '@/lib/cache-utils'

// GET /api/ads/[id] - Récupérer une annonce par ID
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params

        // Appel du service
        const ad = await AdService.getAdById(id)

        // NE PAS incrémenter les vues ici (sera fait via /api/ads/[id]/views)

        return NextResponse.json({
            success: true,
            data: ad,
        })
    } catch (error) {
        logServerError(error, { route: '/api/ads/[id]', action: 'get_ad' })

        if (error instanceof Error && error.message === 'Annonce non trouvée') {
            return NextResponse.json(
                { success: false, error: 'Annonce non trouvée' },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}

// PATCH /api/ads/[id] - Mettre à jour une annonce
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params

        // ✅ SÉCURITÉ: Vérification de l'authentification via session
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        // Utiliser l'ID de la session authentifiée (impossible à usurper)
        const userId = session.user.id

        const body = await request.json()

        // ✅ SÉCURITÉ: Validation stricte des champs modifiables
        const validation = updateAdSchema.safeParse(body)
        if (!validation.success) {
            throw new ValidationError(validation.error.issues[0].message)
        }

        const validatedData = validation.data

        // Récupérer l'annonce actuelle pour comparer les images
        const currentAd = await AdService.getAdById(id)

        // ✅ SÉCURITÉ: Vérifier la propriété avec l'ID de session
        if (currentAd.userId !== userId) {
            throw new ForbiddenError('Vous ne pouvez modifier que vos propres annonces')
        }

        // Supprimer les images orphelines (en arrière-plan)
        if (validatedData.images && currentAd.images) {
            deleteUnusedImages(currentAd.images, validatedData.images).catch(err => {
                console.error('Erreur suppression images orphelines:', err)
            })
        }

        // Appel du service (qui vérifie la propriété)
        // ✅ SÉCURITÉ: On ne passe que les données validées (pas de ...body direct)
        const ad = await AdService.updateAd(id, userId, {
            title: validatedData.title,
            description: validatedData.description,
            price: validatedData.price,
            status: validatedData.status,
            location: validatedData.location,
            condition: validatedData.condition,
            brand: validatedData.brand,
            size: validatedData.size,
            images: validatedData.images,
            deliveryAvailable: validatedData.deliveryAvailable,
            negotiable: validatedData.negotiable,
        })

        // ✅ Invalider le cache des pages liées à cette annonce
        revalidateAdsPages(id, currentAd.category?.slug);

        return NextResponse.json({
            success: true,
            data: ad,
        })
    } catch (error) {
        logServerError(error, { route: '/api/ads/[id]', action: 'update_ad' })

        if (error instanceof Error) {
            if (error.message === 'Annonce non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
        }

        return errorResponse(error, { route: '/api/ads/[id]' })
    }
}

// DELETE /api/ads/[id] - Supprimer une annonce
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params
        // ✅ SÉCURITÉ: Vérification de l'authentification via session
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        // Utiliser l'ID de la session authentifiée (impossible à usurper)
        const userId = session.user.id

        // Appel du service (qui vérifie la propriété)
        await AdService.deleteAd(id, userId)

        // ✅ Invalider le cache des pages liées à cette annonce
        revalidateAdsPages(id);

        return NextResponse.json({
            success: true,
            message: 'Annonce supprimée avec succès',
        })
    } catch (error) {
        logServerError(error, { route: '/api/ads/[id]', action: 'delete_ad' })

        if (error instanceof Error) {
            if (error.message === 'Annonce non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
        }

        return errorResponse(error, { route: '/api/ads/[id]' })
    }
}
