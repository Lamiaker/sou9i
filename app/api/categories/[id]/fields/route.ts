import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SubcategoryFieldService } from '@/services'

// GET /api/categories/[id]/fields - Récupérer les champs d'une catégorie
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const fields = await SubcategoryFieldService.getFieldsByCategory(id)

        return NextResponse.json({
            success: true,
            data: fields,
        })
    } catch (error) {
        console.error('Error fetching category fields:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la récupération des champs',
            },
            { status: 500 }
        )
    }
}

// POST /api/categories/[id]/fields - Créer un nouveau champ (admin)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Vérifier l'authentification admin
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            )
        }

        const { id: categoryId } = await params
        const body = await request.json()

        const {
            name,
            label,
            type,
            placeholder,
            required,
            order,
            options,
            minValue,
            maxValue,
            minLength,
            maxLength,
        } = body

        // Validation basique
        if (!name || !label || !type) {
            return NextResponse.json(
                { success: false, error: 'Le nom, le label et le type sont requis' },
                { status: 400 }
            )
        }

        // Valider le type
        const validTypes = ['TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'BOOLEAN', 'IMAGE']
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { success: false, error: `Type invalide. Types acceptés: ${validTypes.join(', ')}` },
                { status: 400 }
            )
        }

        // Si type SELECT, vérifier que les options sont fournies
        if (type === 'SELECT' && (!options || !Array.isArray(options) || options.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'Les options sont requises pour un champ de type SELECT' },
                { status: 400 }
            )
        }

        const field = await SubcategoryFieldService.createField({
            categoryId,
            name,
            label,
            type,
            placeholder,
            required,
            order,
            options,
            minValue,
            maxValue,
            minLength,
            maxLength,
        })

        return NextResponse.json({
            success: true,
            data: field,
        }, { status: 201 })
    } catch (error) {
        console.error('Error creating field:', error)

        if (error instanceof Error && error.message.includes('existe déjà')) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 409 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de la création du champ',
            },
            { status: 500 }
        )
    }
}

// PUT /api/categories/[id]/fields - Réordonner les champs (admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Vérifier l'authentification admin
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            )
        }

        const { id: categoryId } = await params
        const body = await request.json()

        const { fieldIds } = body

        if (!fieldIds || !Array.isArray(fieldIds)) {
            return NextResponse.json(
                { success: false, error: 'La liste des IDs de champs est requise' },
                { status: 400 }
            )
        }

        const fields = await SubcategoryFieldService.reorderFields(categoryId, fieldIds)

        return NextResponse.json({
            success: true,
            data: fields,
        })
    } catch (error) {
        console.error('Error reordering fields:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors du réordonnancement des champs',
            },
            { status: 500 }
        )
    }
}
