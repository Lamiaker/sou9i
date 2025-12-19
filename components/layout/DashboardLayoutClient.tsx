"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <DashboardSkeleton />;
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
