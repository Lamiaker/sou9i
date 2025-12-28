"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { FavoritesProvider } from "@/context/FavoritesContext";
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
                <FavoritesSyncNotifier />
                {children}
            </FavoritesProvider>
        );
    }

    // Pour les routes dashboard : header + contenu + MobileNav (pas de Footer)
    if (isDashboardRoute) {
        return (
            <FavoritesProvider>
                <FavoritesSyncNotifier />
                <Header />
                <main className="flex-grow pb-20 lg:pb-0">
                    {children}
                </main>
                <MobileNav />
            </FavoritesProvider>
        );
    }

    // Sinon, afficher le layout complet avec header/footer
    return (
        <FavoritesProvider>
            <FavoritesSyncNotifier />
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <MobileNav />
        </FavoritesProvider>
    );
}

