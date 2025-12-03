import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/services'

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email et mot de passe requis')
                }

                // Récupérer l'utilisateur
                const user = await UserService.getUserByEmail(credentials.email)

                if (!user) {
                    throw new Error('Email ou mot de passe incorrect')
                }

                // Vérifier le mot de passe
                const isValidPassword = await UserService.verifyPassword(
                    credentials.password,
                    user.password
                )

                if (!isValidPassword) {
                    throw new Error('Email ou mot de passe incorrect')
                }

                // Retourner l'utilisateur (sans le password)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
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
    secret: process.env.NEXTAUTH_SECRET,
}
