"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Le middleware protège déjà cette route, donc on peut afficher le contenu
    // ou un loader pendant que la session client se synchronise.

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // Si on n'est pas authentifié côté client mais que le middleware a laissé passer,
    // c'est peut-être un délai de synchro. On affiche quand même le layout
    // ou on laisse le contenu gérer ses propres vérifications si besoin.
    // Pour l'instant, on rend le children, car Sidebar gère aussi l'affichage.

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                {children}
            </main>
        </div>
    );
}
