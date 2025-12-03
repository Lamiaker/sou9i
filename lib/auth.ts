import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/services'
import { loginSchema } from '@/lib/validations/auth'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
        updateAge: 24 * 60 * 60, // Mise à jour toutes les 24h
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // 1. Validation stricte des inputs avec Zod
                const parsedCredentials = loginSchema.safeParse(credentials)

                if (!parsedCredentials.success) {
                    throw new Error('Format d\'email ou mot de passe invalide')
                }

                const { email, password } = parsedCredentials.data

                // 2. Récupération de l'utilisateur
                const user = await UserService.getUserByEmail(email)

                if (!user) {
                    // Message générique pour éviter l'énumération des utilisateurs
                    throw new Error('Identifiants invalides')
                }

                // 3. Vérification du mot de passe
                const isValidPassword = await UserService.verifyPassword(
                    password,
                    user.password
                )

                if (!isValidPassword) {
                    throw new Error('Identifiants invalides')
                }

                // 4. Retourner l'utilisateur (sans données sensibles)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
    // 5. Configuration des cookies sécurisés
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    // 6. Secret fort requis
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}
