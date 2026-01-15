"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    // Détecter si on est sur la page messages pour un layout spécial
    const isMessagesPage = pathname?.includes('/dashboard/messages');

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // Pour la page messages sur mobile : layout fullscreen fixe
    if (isMessagesPage) {
        return (
            <div className="fixed inset-0 top-[60px] bottom-[72px] lg:static lg:inset-auto lg:top-auto lg:bottom-auto flex flex-col lg:flex-row bg-gray-50 lg:min-h-screen z-10">
                <Sidebar />
                <main className="flex-1 p-0 lg:p-4 overflow-hidden">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
