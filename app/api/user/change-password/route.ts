import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/services'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { currentPassword, newPassword } = body

        // Validation
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Mot de passe actuel et nouveau mot de passe requis' },
                { status: 400 }
            )
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        // Vérifier le mot de passe actuel
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                password: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            )
        }

        const isValidPassword = await UserService.verifyPassword(
            currentPassword,
            user.password
        )

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Mot de passe actuel incorrect' },
                { status: 400 }
            )
        }

        // Changer le mot de passe
        await UserService.updatePassword(session.user.id, newPassword)

        return NextResponse.json(
            { message: 'Mot de passe mis à jour avec succès' },
            { status: 200 }
        )
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error)
        return NextResponse.json(
            { error: 'Une erreur est survenue' },
            { status: 500 }
        )
    }
}
