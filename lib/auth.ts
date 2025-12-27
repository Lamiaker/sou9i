import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { UserService } from '@/services'
import { loginSchema } from '@/lib/validations/auth'

// Extend NextAuth types for role support
declare module 'next-auth' {
    interface User {
        role?: 'USER' | 'ADMIN'
        isBanned?: boolean
        banReason?: string | null
    }
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            image?: string | null
            phone?: string | null
            role: 'USER' | 'ADMIN'
            isBanned: boolean
            banReason?: string | null
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: 'USER' | 'ADMIN'
        phone?: string | null
        isBanned: boolean
        banReason?: string | null
    }
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 jours
        updateAge: 0, // Force le check à chaque accès
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

                // 2. Récupération de l'utilisateur avec le rôle
                const user: any = await prisma.user.findUnique({
                    where: { email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                        avatar: true,
                        password: true,
                        role: true,
                        isBanned: true,
                        banReason: true,
                    },
                } as any);

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

                // 4. Vérification si banni
                if (user.isBanned) {
                    throw new Error(`Votre compte a été suspendu pour la raison suivante : ${user.banReason || 'Non spécifiée'}`)
                }

                // 5. Retourner l'utilisateur avec le rôle
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    image: user.avatar,
                    role: user.role as 'USER' | 'ADMIN',
                    isBanned: user.isBanned,
                    banReason: user.banReason,
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
        async jwt({ token, user, trigger, session }) {
            // Initial sign in: on récupère les infos de l'utilisateur
            if (user) {
                token.id = user.id
                token.role = user.role || 'USER'
                token.phone = (user as any).phone || null
                token.isBanned = user.isBanned || false
                token.banReason = user.banReason || null
            }

            // Mise à jour LIVE : on vérifie en base de données si l'utilisateur est banni
            // Cela permet de kicker un utilisateur déjà connecté dès que l'admin le bannit
            if (token.id) {
                try {
                    const dbUser: any = await prisma.user.findUnique({
                        where: { id: token.id },
                        select: { isBanned: true, role: true, banReason: true, name: true, phone: true, avatar: true }
                    } as any);

                    if (dbUser) {
                        token.isBanned = dbUser.isBanned;
                        token.role = dbUser.role || 'USER';
                        token.banReason = dbUser.banReason || null;
                        token.name = dbUser.name;
                        token.phone = dbUser.phone || null;
                        token.picture = dbUser.avatar;
                    } else {
                        // Utilisateur supprimé
                        token.isBanned = true;
                    }
                } catch (error) {
                    console.error("JWT Session check error:", error);
                }
            }

            // Permettre la mise à jour forcée via le hook useSession().update()
            if (trigger === "update" && session) {
                if (session.isBanned !== undefined) token.isBanned = session.isBanned;
                if (session.role !== undefined) token.role = session.role;
                if (session.banReason !== undefined) token.banReason = session.banReason;
                if (session.name !== undefined) token.name = session.name;
                if (session.image !== undefined) token.picture = session.image;
            }

            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as 'USER' | 'ADMIN'
                session.user.phone = token.phone as string | null
                session.user.isBanned = token.isBanned as boolean
                session.user.banReason = token.banReason as string | null
                session.user.name = token.name as string
                session.user.image = token.picture as string
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
