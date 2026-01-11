import { NextRequest, NextResponse } from 'next/server';
import { PasswordResetService } from '@/services';
import { z } from 'zod';
import { checkPasswordResetRateLimit, getClientIP } from '@/lib/rate-limit-hybrid';
import { logServerError, ERROR_MESSAGES } from '@/lib/errors';
import { verifyTurnstileToken } from '@/lib/turnstile';

// Schéma de validation
const forgotPasswordSchema = z.object({
    email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
    try {
        // ✅ SÉCURITÉ: Rate Limiting hybride (Redis avec fallback mémoire)
        const ip = getClientIP(request);
        const body = await request.json();

        // 0. Vérification CAPTCHA en production
        if (process.env.NODE_ENV === 'production') {
            if (!body.captchaToken) {
                return NextResponse.json(
                    { error: 'CAPTCHA requis' },
                    { status: 400 }
                );
            }
            const captchaResult = await verifyTurnstileToken(body.captchaToken, ip);
            if (!captchaResult.success) {
                return NextResponse.json(
                    { error: captchaResult.error || 'Échec de la vérification CAPTCHA' },
                    { status: 400 }
                );
            }
        }

        const rateLimitResult = await checkPasswordResetRateLimit(ip);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Trop de tentatives. Veuillez patienter avant de réessayer.',
                    retryAfter: rateLimitResult.retryAfter || 3600
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimitResult.retryAfter || 3600),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
                    }
                }
            );
        }

        // const body = await request.json(); // Deja fait au dessus

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
