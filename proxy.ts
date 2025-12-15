import { withAuth } from "next-auth/middleware"

export default withAuth(
    function middleware(req) {
        // Logique personnalisée si besoin
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
        secret: process.env.NEXTAUTH_SECRET,
    }
)

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/deposer',
    ],
}
