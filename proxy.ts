import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;
        const isBanned = token?.isBanned;

        // 1. Système de BANNI (Global)
        if (isBanned && pathname !== "/banned") {
            return NextResponse.redirect(new URL("/banned", req.url));
        }

        if (!isBanned && pathname === "/banned") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // 2. Protection des routes admin
        if (pathname.startsWith('/admin')) {
            // Si l'utilisateur n'est pas admin, rediriger vers l'accueil
            if (token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/', req.url))
            }
        }

        // Autoriser l'accès
        return NextResponse.next()
    },
    {
        callbacks: {
            // Autoriser l'accès si l'utilisateur a un token valide
            authorized: ({ token }) => !!token
        },
        secret: process.env.NEXTAUTH_SECRET,
    }
)

export const config = {
    matcher: [
        /*
         * Appliquer à toutes les routes sauf API, statiques et auth pages
         */
        "/((?!api|_next/static|_next/image|favicon.ico|login|signup|banned).*)",
    ],
}

