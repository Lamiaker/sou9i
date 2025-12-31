import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/services';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';

// ✅ SÉCURITÉ: Rate limiting - 3 tentatives par heure par IP
const limiter = rateLimit({
    interval: 60 * 60 * 1000, // 1 heure
    uniqueTokenPerInterval: 500, // Max 500 IPs suivies
});

// Schéma de validation
const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
    try {
        // ✅ SÉCURITÉ: Rate Limiting par IP
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'anonymous';

        try {
            await limiter.check(3, ip); // 3 requêtes max par heure par IP
        } catch {
            return NextResponse.json(
                {
                    error: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
                    retryAfter: 3600 // 1 heure en secondes
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': '3600',
                    }
                }
            );
        }

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
        logServerError(error, { route: '/api/auth/forgot-password', action: 'request_reset' });
        return NextResponse.json(
            { error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}
