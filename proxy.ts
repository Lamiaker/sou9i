
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// URL secrète du panneau admin (ne pas divulguer)
const ADMIN_PATH = '/sl-panel-9x7k';


// Cookie de session admin
const ADMIN_SESSION_COOKIE = 'admin-session';

async function hasValidAdminCookie(request: NextRequest): Promise<boolean> {
    const adminToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    return !!adminToken && adminToken.length === 64;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ============================================
    // BLOQUER /admin (ancienne URL)
    // ============================================
    if (pathname.startsWith('/admin')) {
        // Rediriger vers 404 pour cacher l'existence du panneau admin
        return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    // ============================================
    // ROUTES ADMIN - URL secrète
    // ============================================
    if (pathname.startsWith(ADMIN_PATH)) {
        // Page de login admin
        if (pathname === `${ADMIN_PATH}/login`) {
            const hasAdminSession = await hasValidAdminCookie(request);
            if (hasAdminSession) {
                return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
            }
            return NextResponse.next();
        }

        // Autres routes admin
        const hasAdminSession = await hasValidAdminCookie(request);

        if (!hasAdminSession) {
            return NextResponse.redirect(new URL(`${ADMIN_PATH}/login`, request.url));
        }

        return NextResponse.next();
    }

    // ============================================
    // ROUTES UTILISATEUR - NextAuth
    // ============================================
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Page /banned
    if (pathname === '/banned') {
        if (!token || !token.isBanned) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Routes protégées utilisateur
    if (pathname.startsWith('/dashboard') || pathname === '/deposer') {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        if (token.isBanned) {
            return NextResponse.redirect(new URL('/banned', request.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/deposer',
        '/admin/:path*',
        '/sl-panel-9x7k/:path*',
        '/banned',
    ],
};
