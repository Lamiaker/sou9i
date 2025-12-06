import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CategoryService } from '@/services/categoryService'

// GET /api/categories/[id] - Récupérer une catégorie par ID ou slug
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params
        const searchParams = request.nextUrl.searchParams
        const includeRelations = searchParams.get('includeRelations') !== 'false'

        console.log('Fetching category with id/slug:', id)

        let category

        // Recherche par ID ou par Slug
        category = await prisma.category.findFirst({
            where: {
                OR: [
                    { id: id },
                    { slug: id }
                ]
            },
            include: includeRelations ? {
                parent: true,
                children: {
                    include: {
                        _count: {
                            select: {
                                ads: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        ads: true,
                        children: true,
                    },
                },
            } : undefined,
        })

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Catégorie non trouvée' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error('Error fetching category:', error)

        if (error instanceof Error && error.message === 'Catégorie non trouvée') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération de la catégorie'
            },
            { status: 500 }
        )
    }
}

// PUT /api/categories/[id] - Mettre à jour une catégorie
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params
        const body = await request.json()

        const {
            name,
            slug,
            icon,
            description,
            order,
            parentId,
        } = body

        // Appel du service
        const category = await CategoryService.updateCategory(id, {
            name,
            slug,
            icon,
            description,
            order: order !== undefined ? parseInt(order) : undefined,
            parentId,
        })

        return NextResponse.json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error('Error updating category:', error)

        if (error instanceof Error) {
            if (error.message === 'Catégorie non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
            if (error.message.includes('existe déjà')) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la catégorie'
            },
            { status: 500 }
        )
    }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const { id } = params

        await CategoryService.deleteCategory(id)

        return NextResponse.json({
            success: true,
            message: 'Catégorie supprimée avec succès',
        })
    } catch (error) {
        console.error('Error deleting category:', error)

        if (error instanceof Error) {
            if (error.message === 'Catégorie non trouvée') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 404 }
                )
            }
            if (error.message.includes('Impossible de supprimer')) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la catégorie'
            },
            { status: 500 }
        )
    }
}
