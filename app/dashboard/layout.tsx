"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login?redirect=/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
                {children}
            </main>
        </div>
    );
}
