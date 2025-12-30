import { NextResponse } from 'next/server';
import { PasswordResetService } from '@/services';
import { z } from 'zod';

// Schéma de validation
const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validation des données
        const validation = forgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Email invalide' },
                { status: 400 }
            );
        }

        const { email } = validation.data;

        // Demande de réinitialisation
        const result = await PasswordResetService.requestPasswordReset(email);

        // Toujours retourner un succès pour éviter l'énumération des comptes
        // Même si l'opération interne a échoué partiellement
        return NextResponse.json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('[ForgotPassword API] Erreur:', error);
        return NextResponse.json(
            { error: 'Une erreur est survenue. Veuillez réessayer.' },
            { status: 500 }
        );
    }
}
