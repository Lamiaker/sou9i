

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hasPermission, hasAnyPermission, AdminSessionData } from './admin-auth';
import { AdminPermission } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export type AdminApiHandler<T = any> = (
    request: NextRequest,
    context: { admin: AdminSessionData['admin']; params?: any }
) => Promise<NextResponse<T>>;

export interface RequireAdminOptions {
    permissions?: AdminPermission[];
    requireAll?: boolean; // Si true, toutes les permissions sont requises. Sinon, une seule suffit.
}

// ============================================
// GUARDS POUR API ROUTES
// ============================================

/**
 * Vérifie l'authentification admin et retourne l'admin ou une erreur
 */
export async function requireAdmin(
    request: NextRequest,
    options: RequireAdminOptions = {}
): Promise<{ admin: AdminSessionData['admin'] } | NextResponse> {
    const session = await getAdminSession();

    if (!session) {
        return NextResponse.json(
            { error: 'Non autorisé', code: 'UNAUTHORIZED' },
            { status: 401 }
        );
    }

    // Vérifier les permissions si spécifiées
    if (options.permissions && options.permissions.length > 0) {
        const hasRequiredPermissions = options.requireAll
            ? options.permissions.every(p => hasPermission(session.admin, p))
            : hasAnyPermission(session.admin, options.permissions);

        if (!hasRequiredPermissions) {
            return NextResponse.json(
                { error: 'Permissions insuffisantes', code: 'FORBIDDEN' },
                { status: 403 }
            );
        }
    }

    return { admin: session.admin };
}

/**
 * Wrapper HOF pour protéger une route API admin
 * Utilisable avec les App Router API Routes
 */
export function withAdminAuth<T = any>(
    handler: AdminApiHandler<T>,
    options: RequireAdminOptions = {}
) {
    return async (request: NextRequest, context?: any): Promise<NextResponse<T>> => {
        const result = await requireAdmin(request, options);

        // Si c'est une NextResponse, c'est une erreur
        if (result instanceof NextResponse) {
            return result as NextResponse<T>;
        }

        // Sinon, on a l'admin
        return handler(request, { admin: result.admin, params: context?.params });
    };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Extrait l'IP et le User-Agent de la requête
 */
export function getRequestContext(request: NextRequest): {
    ipAddress: string | undefined;
    userAgent: string | undefined;
} {
    const ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        undefined;

    const userAgent = request.headers.get('user-agent') || undefined;

    return { ipAddress, userAgent };
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function adminErrorResponse(
    message: string,
    status: number = 500,
    code?: string
): NextResponse {
    return NextResponse.json(
        { error: message, code: code || 'ERROR' },
        { status }
    );
}

/**
 * Crée une réponse de succès standardisée
 */
export function adminSuccessResponse<T>(
    data: T,
    message?: string
): NextResponse {
    return NextResponse.json({
        success: true,
        message,
        ...data
    });
}
