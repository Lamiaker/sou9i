/**
 * Utilitaire pour valider les tokens Cloudflare Turnstile côté serveur
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes'?: string[];
    challenge_ts?: string;
    hostname?: string;
}

export async function verifyTurnstileToken(token: string, ip?: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error('[Turnstile] TURNSTILE_SECRET_KEY non configurée');
        // En développement, on peut laisser passer si pas de clé
        if (process.env.NODE_ENV === 'development') {
            return { success: true };
        }
        return { success: false, error: 'Configuration CAPTCHA manquante' };
    }

    if (!token) {
        return { success: false, error: 'CAPTCHA requis' };
    }

    try {
        const formData = new FormData();
        formData.append('secret', secretKey);
        formData.append('response', token);
        if (ip) {
            formData.append('remoteip', ip);
        }

        const response = await fetch(TURNSTILE_VERIFY_URL, {
            method: 'POST',
            body: formData,
        });

        const result: TurnstileVerifyResponse = await response.json();

        if (result.success) {
            return { success: true };
        }

        console.warn('[Turnstile] Échec de vérification:', result['error-codes']);
        return {
            success: false,
            error: 'Vérification CAPTCHA échouée. Veuillez réessayer.'
        };
    } catch (error) {
        console.error('[Turnstile] Erreur de vérification:', error);
        return {
            success: false,
            error: 'Erreur de vérification CAPTCHA'
        };
    }
}
