"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BanGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Rediriger si l'utilisateur est banni
        if (status === "authenticated" && session?.user?.isBanned && pathname !== "/banned") {
            router.push("/banned");
        }
    }, [session, status, pathname, router]);

    // Bloquer le rendu si banni
    if (status === "authenticated" && session?.user?.isBanned && pathname !== "/banned") {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="animate-pulse text-red-500 font-bold">Compte suspendu...</div>
            </div>
        );
    }

    return <>{children}</>;
}
