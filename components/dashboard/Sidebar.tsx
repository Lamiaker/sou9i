"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MessageCircle,
    User,
    Settings,
    HelpCircle,
    Megaphone,
    Bell
} from "lucide-react";

const menuItems = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes annonces", href: "/dashboard/annonces", icon: ShoppingBag },
    { name: "Mes favoris", href: "/dashboard/favoris", icon: Heart },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Messagerie", href: "/dashboard/messages", icon: MessageCircle },
    { name: "Mon profil", href: "/dashboard/profil", icon: User },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

const otherMenuItems = [
    { name: "Aide & Support", href: "/dashboard/support", icon: HelpCircle },
    { name: "Publicité", href: "/dashboard/publicite", icon: Megaphone },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-[64px]">
                <div className="p-6 flex-1 overflow-y-auto">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Espace Vendeur
                    </h2>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? "bg-orange-50 text-primary"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Separator */}
                    <div className="my-6 border-t border-gray-200" />

                    {/* Other Links */}
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Autres
                    </h2>
                    <nav className="space-y-1">
                        {otherMenuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? "bg-orange-50 text-primary"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-primary" : "text-gray-400"} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
        </>
    );
}
