import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, name, password, phone, city } = body

        // Validation
        if (!email || !name || !password || !phone || !city) {
            return NextResponse.json(
                { success: false, error: 'Tous les champs sont requis' },
                { status: 400 }
            )
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Email invalide' },
                { status: 400 }
            )
        }

        // Validation mot de passe
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' },
                { status: 400 }
            )
        }

        // Validation téléphone (format algérien)
        const phoneRegex = /^(05|06|07)[0-9]{8}$/
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return NextResponse.json(
                { success: false, error: 'Numéro de téléphone invalide' },
                { status: 400 }
            )
        }

        // Créer l'utilisateur
        const user = await UserService.createUser({
            email,
            name,
            password,
            phone: phone.replace(/\s/g, ''), // Enlever les espaces
            city,
        })

        return NextResponse.json(
            {
                success: true,
                message: 'Compte créé avec succès',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error during signup:', error)

        if (error instanceof Error) {
            if (error.message === 'Cet email est déjà utilisé') {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            { success: false, error: 'Une erreur est survenue lors de l\'inscription' },
            { status: 500 }
        )
    }
}
