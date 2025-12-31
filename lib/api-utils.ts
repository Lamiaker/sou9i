import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
    AppError,
    isAppError,
    getErrorMessage,
    getErrorStatusCode,
    logServerError,
    ERROR_MESSAGES,
    AuthenticationError,
    ForbiddenError,
} from '@/lib/errors';

/**
 * Type pour une réponse API standardisée
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    message?: string;
}

/**
 * Crée une réponse de succès standardisée
 */
export function successResponse<T>(
    data: T,
    status: number = 200,
    message?: string
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            ...(message && { message }),
        },
        { status }
    );
}

/**
 * Crée une réponse d'erreur standardisée
 * Ne révèle jamais de détails techniques au client
 */
export function errorResponse(
    error: unknown,
    context?: { route?: string; action?: string }
): NextResponse<ApiResponse> {
    // Log l'erreur côté serveur avec tous les détails
    logServerError(error, context);

    // Récupérer le message et le code appropriés
    const message = getErrorMessage(error);
    const statusCode = getErrorStatusCode(error);
    const code = isAppError(error) ? error.code : undefined;

    return NextResponse.json(
        {
            success: false,
            error: message,
            ...(code && { code }),
        },
        { status: statusCode }
    );
}

/**
 * Type pour les handlers API
 */
type ApiHandler<T = unknown> = (
    request: Request,
    context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse<ApiResponse<T>> | Response>;

/**
 * Wrapper pour les handlers API avec gestion d'erreurs automatique
 */
export function withErrorHandler<T>(
    handler: ApiHandler<T>,
    routeName?: string
): ApiHandler<T> {
    return async (request, context) => {
        try {
            return await handler(request, context);
        } catch (error) {
            return errorResponse(error, {
                route: routeName || request.url,
            });
        }
    };
}

/**
 * Interface pour les options d'auth
 */
interface AuthOptions {
    requireAdmin?: boolean;
}

/**
 * Wrapper qui vérifie l'authentification avant d'exécuter le handler
 */
export function withAuth<T>(
    handler: (
        request: Request,
        session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
        context?: { params?: Promise<Record<string, string>> }
    ) => Promise<NextResponse<ApiResponse<T>> | Response>,
    options: AuthOptions = {}
): ApiHandler<T> {
    return async (request, context) => {
        try {
            const session = await getServerSession(authOptions);

            if (!session) {
                throw new AuthenticationError();
            }

            if (options.requireAdmin && session.user.role !== 'ADMIN') {
                throw new ForbiddenError();
            }

            return await handler(request, session, context);
        } catch (error) {
            return errorResponse(error, {
                route: request.url,
            });
        }
    };
}

/**
 * Valide que les champs requis sont présents dans le body
 * Retourne le body parsé ou throw une ValidationError
 */
export async function validateBody<T extends Record<string, unknown>>(
    request: Request,
    requiredFields: (keyof T)[]
): Promise<T> {
    let body: T;

    try {
        body = await request.json();
    } catch {
        throw new AppError('Corps de la requête invalide', 400, 'INVALID_BODY');
    }

    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            throw new AppError(
                `Le champ "${String(field)}" est requis`,
                400,
                'MISSING_FIELD'
            );
        }
    }

    return body;
}

/**
 * Messages d'erreur réexportés pour utilisation dans les handlers
 */
export { ERROR_MESSAGES };
