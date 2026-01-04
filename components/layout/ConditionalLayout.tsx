"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { MessagesProvider } from "@/context/MessagesContext";
import { FavoritesSyncNotifier } from "@/components/FavoritesSyncNotifier";

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Routes où le header/footer ne doit PAS apparaître
    const isAdminRoute = pathname?.startsWith('/admin');

    // Routes du dashboard (ont leur propre layout avec MobileNav)
    const isDashboardRoute = pathname?.startsWith('/dashboard');

    // Si c'est une route admin, afficher uniquement le contenu sans header/footer
    if (isAdminRoute) {
        return (
            <FavoritesProvider>
                <MessagesProvider>
                    <FavoritesSyncNotifier />
                    {children}
                </MessagesProvider>
            </FavoritesProvider>
        );
    }

    // Pour les routes dashboard : header + contenu + MobileNav (pas de Footer)
    if (isDashboardRoute) {
        return (
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
        );
    }

    // Sinon, afficher le layout complet avec header/footer
    return (
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
    );
}

