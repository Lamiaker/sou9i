import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const token = req.nextauth.token

        // Protection des routes admin
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
        '/dashboard/:path*',
        '/deposer',
        '/admin/:path*',
    ],
}

