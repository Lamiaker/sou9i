"use client";

import SessionProvider from "@/components/providers/SessionProvider";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { FavoritesSyncNotifier } from "@/components/FavoritesSyncNotifier";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

/**
 * Client wrapper pour les pages publiques
 * 
 * Ce composant client encapsule tous les providers nécessaires.
 * Le SessionProvider est inclus ici pour permettre aux composants enfants
 * (Header, FavoritesProvider, etc.) d'accéder à useSession().
 * 
 * IMPORTANT: Ce composant est "use client", mais le layout parent reste
 * un Server Component. Cela permet à Next.js de :
 * 1. Générer le HTML statique au build time (ISR)
 * 2. Hydrater les parties dynamiques côté client après chargement
 */
export default function PublicLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <FavoritesProvider>
                <MessagesProvider>
                    <FavoritesSyncNotifier />
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <MobileNav />
                </MessagesProvider>
            </FavoritesProvider>
        </SessionProvider>
    );
}
