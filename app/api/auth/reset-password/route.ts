import { NextResponse } from 'next/server';
import { PasswordResetService } from '@/services';
import { z } from 'zod';

// Schéma de validation pour vérification du token
const verifyTokenSchema = z.object({
    token: z.string().min(1, 'Token requis'),
});

// Schéma de validation pour réinitialisation
const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requis'),
    password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
        ),
});

/**
 * GET - Vérifie si un token est valide
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        // Validation
        const validation = verifyTokenSchema.safeParse({ token });
        if (!validation.success) {
            return NextResponse.json(
                { valid: false, error: 'Token invalide' },
                { status: 400 }
            );
        }

        // Vérification du token
        const result = await PasswordResetService.verifyToken(validation.data.token);

        return NextResponse.json({
            valid: result.valid,
        });

    } catch (error) {
        console.error('[ResetPassword API] Erreur vérification:', error);
        return NextResponse.json(
            { valid: false, error: 'Une erreur est survenue' },
            { status: 500 }
        );
    }
}

/**
 * POST - Réinitialise le mot de passe
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validation des données
        const validation = resetPasswordSchema.safeParse(body);
        if (!validation.success) {
            const issues = validation.error.issues;
            const firstError = issues[0]?.message || 'Données invalides';
            return NextResponse.json(
                { success: false, error: firstError },
                { status: 400 }
            );
        }

        const { token, password } = validation.data;

        // Réinitialisation du mot de passe
        const result = await PasswordResetService.resetPassword(token, password);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: result.message,
        });

    } catch (error) {
        console.error('[ResetPassword API] Erreur reset:', error);
        return NextResponse.json(
            { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' },
            { status: 500 }
        );
    }
}
