import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SubcategoryFieldService } from '@/services'
import { logServerError, getErrorMessage, ERROR_MESSAGES } from '@/lib/errors'

// GET /api/categories/[id]/fields/[fieldId] - Récupérer un champ spécifique
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
    try {
        const { fieldId } = await params
        const field = await SubcategoryFieldService.getFieldById(fieldId)

        return NextResponse.json({
            success: true,
            data: field,
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('non trouvé')) {
            return NextResponse.json(
                { success: false, error: 'Champ non trouvé' },
                { status: 404 }
            )
        }

        logServerError(error, { route: '/api/categories/[id]/fields/[fieldId]', action: 'get_field' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}

// PUT /api/categories/[id]/fields/[fieldId] - Modifier un champ (admin)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fieldId: string }> }
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

        const { fieldId } = await params
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

        // Si type fourni, le valider
        if (type) {
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
        }

        const field = await SubcategoryFieldService.updateField(fieldId, {
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
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('non trouvé')) {
            return NextResponse.json(
                { success: false, error: 'Champ non trouvé' },
                { status: 404 }
            )
        }

        if (error instanceof Error && error.message.includes('existe déjà')) {
            return NextResponse.json(
                { success: false, error: getErrorMessage(error) },
                { status: 409 }
            )
        }

        logServerError(error, { route: '/api/categories/[id]/fields/[fieldId]', action: 'update_field' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}

// DELETE /api/categories/[id]/fields/[fieldId] - Supprimer un champ (admin)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; fieldId: string }> }
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

        const { fieldId } = await params
        await SubcategoryFieldService.deleteField(fieldId)

        return NextResponse.json({
            success: true,
            message: 'Champ supprimé avec succès',
        })
    } catch (error) {
        if (error instanceof Error && error.message.includes('non trouvé')) {
            return NextResponse.json(
                { success: false, error: 'Champ non trouvé' },
                { status: 404 }
            )
        }

        logServerError(error, { route: '/api/categories/[id]/fields/[fieldId]', action: 'delete_field' });
        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        )
    }
}
