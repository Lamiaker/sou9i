import { NextRequest, NextResponse } from 'next/server'
import { revalidateAdsPages } from '@/lib/cache-utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdService } from '@/services'
import { logServerError, ERROR_MESSAGES, AuthenticationError } from '@/lib/errors'
import { createAdSchema, adFiltersSchema, validateSearchParams } from '@/lib/validations'
import { checkAdCreationRateLimit } from '@/lib/rate-limit-hybrid'

// GET /api/ads - Récupérer toutes les annonces avec filtres
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // ✅ Validation des paramètres de recherche
        const validation = validateSearchParams(searchParams, adFiltersSchema)

        // Construire les filtres (avec valeurs par défaut si validation échoue)
        const filters = {
            categoryId: searchParams.get('subcategoryId') || searchParams.get('categoryId') || undefined,
            minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
            location: searchParams.get('location') || undefined,
            condition: searchParams.get('condition') || undefined,
            search: searchParams.get('search')?.slice(0, 200) || undefined, // Limite la recherche
            status: searchParams.get('status') || 'active',
            userId: searchParams.get('userId') || undefined,
            moderationStatus: searchParams.get('moderationStatus') || undefined,
        }

        // Pagination avec limites de sécurité
        const page = Math.max(1, Number(searchParams.get('page')) || 1)
        const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 12))

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

        // ✅ SÉCURITÉ: Rate Limiting Hybride (10 annonces / heure)
        const rateLimitResult = await checkAdCreationRateLimit(userId)
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Vous avez atteint la limite de création d'annonces. Veuillez réessayer plus tard.",
                    retryAfter: rateLimitResult.retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 3600),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                    }
                }
            )
        }

        // ✅ SÉCURITÉ: Validation complète avec Zod
        let body
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { success: false, error: 'Corps de la requête invalide' },
                { status: 400 }
            )
        }

        const validation = createAdSchema.safeParse(body)

        if (!validation.success) {
            const errors = validation.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))

            return NextResponse.json(
                {
                    success: false,
                    error: 'Données invalides',
                    details: errors,
                },
                { status: 400 }
            )
        }

        const validatedData = validation.data

        // Appel du service avec données validées
        const ad = await AdService.createAd({
            title: validatedData.title,
            description: validatedData.description,
            price: typeof validatedData.price === 'number' ? validatedData.price : parseFloat(String(validatedData.price)),
            location: validatedData.location,
            contactPhone: validatedData.contactPhone || null,
            categoryId: validatedData.categoryId,
            userId,
            condition: validatedData.condition,
            brand: validatedData.brand,
            size: validatedData.size,
            images: validatedData.images,
            showPhone: validatedData.showPhone,
            deliveryAvailable: validatedData.deliveryAvailable,
            negotiable: validatedData.negotiable,
            dynamicFields: validatedData.dynamicFields,
        })

        // Revalider les chemins pour mettre à jour les caches
        revalidateAdsPages(ad.id);

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


