
import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/admin-auth';
import { z } from 'zod';

// Schéma de validation
const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Mot de passe trop court'),
});

export async function POST(request: NextRequest) {
    try {
        // Récupérer le contexte de la requête
        const ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            undefined;
        const userAgent = request.headers.get('user-agent') || undefined;

        // Parser et valider le body
        const body = await request.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Données invalides', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Tenter la connexion
        const result = await loginAdmin(email, password, ipAddress, userAgent);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            );
        }

        // Succès - le cookie est déjà défini par loginAdmin
        return NextResponse.json({
            success: true,
            admin: {
                id: result.admin!.id,
                name: result.admin!.name,
                email: result.admin!.email,
                isSuperAdmin: result.admin!.isSuperAdmin,
            }
        });

    } catch (error) {
        console.error('Admin login API error:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}


