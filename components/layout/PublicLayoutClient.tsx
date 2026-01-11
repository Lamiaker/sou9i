"use client";

import { Suspense, lazy } from "react";
import { useSession } from "next-auth/react";
import SessionProvider from "@/components/providers/SessionProvider";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { FavoritesSyncNotifier } from "@/components/FavoritesSyncNotifier";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

// ✅ OPTIMISATION: Chargement dynamique du MessagesProvider
// socket.io-client (~60KB) n'est chargé que pour les utilisateurs authentifiés
const MessagesProvider = lazy(() =>
    import("@/context/MessagesContext").then(mod => ({ default: mod.MessagesProvider }))
);

/**
 * Wrapper interne qui gère le chargement conditionnel de MessagesProvider
 */
function ConditionalMessagesProvider({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    // Ne charger MessagesProvider que si l'utilisateur est authentifié
    if (status === "authenticated") {
        return (
            <Suspense fallback={<>{children}</>}>
                <MessagesProvider>
                    {children}
                </MessagesProvider>
            </Suspense>
        );
    }

    // Pour les visiteurs non authentifiés, pas de socket.io
    return <>{children}</>;
}


export default function PublicLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <FavoritesProvider>
                <ConditionalMessagesProvider>
                    <FavoritesSyncNotifier />
                    <Header />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                    <MobileNav />
                </ConditionalMessagesProvider>
            </FavoritesProvider>
        </SessionProvider>
    );
}
