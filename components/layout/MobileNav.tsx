"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Heart, MessageCircle, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes annonces", href: "/dashboard/annonces", icon: ShoppingBag },
    { name: "Mes favoris", href: "/dashboard/favoris", icon: Heart },
    { name: "Messagerie", href: "/dashboard/messages", icon: MessageCircle },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    // Ne pas afficher si l'utilisateur n'est pas connecté
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 pb-safe">
            <nav className="flex justify-around items-center h-16 px-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-gray-500"
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
                {/* Mobile 'More' Menu Item (optional, for settings/logout) */}
                <Link
                    href="/dashboard/settings"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/dashboard/settings" ? "text-primary" : "text-gray-500"
                        }`}
                >
                    <Settings size={24} strokeWidth={pathname === "/dashboard/settings" ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">Paramètres</span>
                </Link>
            </nav>
        </div>
    );
}
