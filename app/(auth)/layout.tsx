import type { Metadata } from 'next';
import PublicLayoutClient from "@/components/layout/PublicLayoutClient";

/**
 * Layout pour les pages d'authentification (login, signup, forgot-password, etc.)
 * 
 * ✅ Ce layout contient :
 * - force-dynamic (pas de cache pour les formulaires auth)
 * - SessionProvider (vérifie si déjà connecté pour redirect)
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Connexion / Inscription | SweetLook',
    description: 'Connectez-vous ou créez un compte sur SweetLook pour commencer à vendre et acheter.',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PublicLayoutClient>
            <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </PublicLayoutClient>
    );
}