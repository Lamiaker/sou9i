import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdService } from '@/services'
import { logServerError, ERROR_MESSAGES, AuthenticationError } from '@/lib/errors'
import { errorResponse } from '@/lib/api-utils'

// GET /api/ads - Récupérer toutes les annonces avec filtres
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Construire les filtres
        const filters = {
            // Si une sous-catégorie est sélectionnée, on l'utilise pour le filtrage
            // Sinon on utilise la catégorie principale
            categoryId: searchParams.get('subcategoryId') || searchParams.get('categoryId') || undefined,
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
            location: searchParams.get('location') || undefined,
            condition: searchParams.get('condition') || undefined,
            search: searchParams.get('search') || undefined,
            status: searchParams.get('status') || 'active',
            userId: searchParams.get('userId') || undefined,
            moderationStatus: searchParams.get('moderationStatus') || undefined,
        }

        // Pagination
        const page = Number(searchParams.get('page')) || 1
        const limit = Number(searchParams.get('limit')) || 12

        // Appel du service
        const result = await AdService.getAds(filters, page, limit)

        return NextResponse.json({
            success: true,
            data: result.ads,
            pagination: result.pagination,
        })
    } catch (error) {
        logServerError(error, { route: '/api/ads', action: 'get_ads' })
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.GENERIC
            },
            { status: 500 }
        )
    }
}

// POST /api/ads - Créer une nouvelle annonce
export async function POST(request: NextRequest) {
    try {
        // ✅ SÉCURITÉ: Vérification de l'authentification via session
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            throw new AuthenticationError()
        }

        // Utiliser l'ID de la session authentifiée (impossible à usurper)
        const userId = session.user.id

        const body = await request.json()

        const {
            title,
            description,
            price,
            categoryId,
            images,
            location,
            contactPhone,
            condition,
            brand,
            size,
            deliveryAvailable,
            negotiable,
            dynamicFields,
        } = body

        // Validation basique
        if (!title || !description || !price || !categoryId || !location) {
            return NextResponse.json(
                { success: false, error: 'Champs requis manquants' },
                { status: 400 }
            )
        }

        // Appel du service
        const ad = await AdService.createAd({
            title,
            description,
            price: parseFloat(price),
            location,
            contactPhone: contactPhone || null,
            categoryId,
            userId,
            condition,
            brand,
            size,
            images,
            deliveryAvailable,
            negotiable,
            dynamicFields,
        })

        // Revalider les chemins pour mettre à jour les caches
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath('/dashboard/annonces');
        // On revalide aussi la page de la catégorie spécifique si possible, mais globalement /categories suffit souvent
        // pour les compteurs globaux. Pour la page de la catégorie spécifique :
        revalidatePath('/categories/[slug]', 'page');
        revalidatePath('/admin/ads');
        revalidatePath('/admin');

        return NextResponse.json({
            success: true,
            data: ad,
        }, { status: 201 })
    } catch (error) {
        logServerError(error, { route: '/api/ads', action: 'create_ad' })
        return NextResponse.json(
            {
                success: false,
                error: ERROR_MESSAGES.SAVE_ERROR
            },
            { status: 500 }
        )
    }
}
