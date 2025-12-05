import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { AdService } from '@/services'

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
        console.error('Error fetching ads:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération des annonces'
            },
            { status: 500 }
        )
    }
}

// POST /api/ads - Créer une nouvelle annonce
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // TODO: Récupérer l'utilisateur depuis la session
        // const session = await getServerSession()
        // if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        // const userId = session.user.id

        const {
            title,
            description,
            price,
            categoryId,
            userId, // Temporaire - à remplacer par session
            images,
            location,
            condition,
            brand,
            size,
            deliveryAvailable,
            negotiable,
        } = body

        // Validation basique
        if (!title || !description || !price || !categoryId || !userId || !location) {
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
            categoryId,
            userId,
            condition,
            brand,
            size,
            images,
            deliveryAvailable,
            negotiable,
        })

        // Revalider les chemins pour mettre à jour les caches
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath('/dashboard/annonces');
        // On revalide aussi la page de la catégorie spécifique si possible, mais globalement /categories suffit souvent
        // pour les compteurs globaux. Pour la page de la catégorie spécifique :
        revalidatePath('/categories/[slug]', 'page');

        return NextResponse.json({
            success: true,
            data: ad,
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating ad:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'annonce'
            },
            { status: 500 }
        )
    }
}
