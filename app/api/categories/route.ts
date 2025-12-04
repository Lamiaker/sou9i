import { NextRequest, NextResponse } from 'next/server'
import { CategoryService } from '@/services'

// GET /api/categories - Récupérer toutes les catégories
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const type = searchParams.get('type') // 'all', 'hierarchy', 'parents'
        const withCount = searchParams.get('withCount') === 'true'
        const parentId = searchParams.get('parentId')

        let categories

        // Si on demande les enfants d'une catégorie spécifique
        if (parentId) {
            categories = await CategoryService.getCategoryChildren(parentId)
            return NextResponse.json({
                success: true,
                data: categories,
            })
        }

        // Selon le type demandé
        switch (type) {
            case 'hierarchy':
                // Catégories hiérarchiques (parents avec leurs enfants)
                categories = await CategoryService.getCategoriesHierarchy()
                break

            case 'parents':
                // Seulement les catégories parentes
                categories = await CategoryService.getParentCategories()
                break

            case 'all':
            default:
                // Toutes les catégories
                if (withCount) {
                    categories = await CategoryService.getCategoriesWithCount()
                } else {
                    categories = await CategoryService.getAllCategories()
                }
                break
        }

        return NextResponse.json({
            success: true,
            data: categories,
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération des catégories'
            },
            { status: 500 }
        )
    }
}

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            name,
            slug,
            icon,
            description,
            order,
            parentId,
        } = body

        // Validation basique
        if (!name || !slug) {
            return NextResponse.json(
                { success: false, error: 'Le nom et le slug sont requis' },
                { status: 400 }
            )
        }

        // Appel du service
        const category = await CategoryService.createCategory({
            name,
            slug,
            icon,
            description,
            order: order ? parseInt(order) : 0,
            parentId,
        })

        return NextResponse.json({
            success: true,
            data: category,
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating category:', error)

        if (error instanceof Error && error.message.includes('existe déjà')) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 409 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie'
            },
            { status: 500 }
        )
    }
}
