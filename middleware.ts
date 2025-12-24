import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;
        const isBanned = token?.isBanned;

        // 1. Protection de la page /banned
        // Seuls les utilisateurs bannis peuvent y accéder
        if (pathname === "/banned") {
            // Si pas de token ou pas banni, rediriger vers l'accueil
            if (!token || !isBanned) {
                return NextResponse.redirect(new URL("/", req.url));
            }
            // Autoriser l'accès pour les utilisateurs bannis
            return NextResponse.next();
        }

        // 2. Système de BANNI (Global) - redirige les bannis vers /banned
        if (isBanned) {
            return NextResponse.redirect(new URL("/banned", req.url));
        }

        // 3. Protection des routes admin
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
            // Pour /banned, autoriser même sans token pour que le middleware puisse rediriger
            authorized: ({ token, req }) => {
                const pathname = req.nextUrl.pathname;
                // Permettre l'accès au middleware pour /banned afin de gérer la redirection
                if (pathname === "/banned") {
                    return true; // Le middleware gérera la logique
                }
                // Pour les autres routes protégées, exiger un token
                return !!token;
            }
        },
        secret: process.env.NEXTAUTH_SECRET,
    }
)

export const config = {
    matcher: [
        /*
         * Protéger uniquement les routes privées :
         * - /dashboard/*
         * - /deposer
         * - /admin/*
         * - /banned (accessible uniquement aux utilisateurs bannis)
         */
        "/dashboard/:path*",
        "/deposer",
        "/admin/:path*",
        "/banned",
    ],
}
