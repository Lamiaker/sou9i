"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { FavoritesProvider } from "@/context/FavoritesContext";

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Routes où le header/footer ne doit PAS apparaître
    const isAdminRoute = pathname?.startsWith('/admin');

    // Si c&apos;est une route admin, afficher uniquement le contenu sans header/footer
    if (isAdminRoute) {
        return (
            <FavoritesProvider>
                {children}
            </FavoritesProvider>
        );
    }

    // Sinon, afficher le layout complet avec header/footer
    return (
        <FavoritesProvider>
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <MobileNav />
        </FavoritesProvider>
    );
}
