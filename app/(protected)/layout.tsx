import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { FavoritesSyncNotifier } from "@/components/FavoritesSyncNotifier";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

/**
 * Layout pour les pages protégées (Dashboard, Deposer, etc.)
 * 
 * ✅ Ce layout contient :
 * - force-dynamic (rendu dynamique obligatoire)
 * - SessionProvider (accès session NextAuth)
 * - SWRProvider (cache client pour données temps réel)
 * 
 * La sécurité (auth + ban) est gérée par le middleware AVANT ce layout.
 */
export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <SWRProvider>
                <FavoritesProvider>
                    <MessagesProvider>
                        <FavoritesSyncNotifier />
                        <Header />
                        <main className="flex-grow pb-20 lg:pb-0">
                            {children}
                        </main>
                        <MobileNav />
                    </MessagesProvider>
                </FavoritesProvider>
            </SWRProvider>
        </SessionProvider>
    );
}
