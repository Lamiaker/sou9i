"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MessageCircle, User, LogOut, Settings } from "lucide-react";

const menuItems = [
    { name: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes annonces", href: "/dashboard/annonces", icon: ShoppingBag },
    { name: "Messagerie", href: "/dashboard/messages", icon: MessageCircle },
    { name: "Mon profil", href: "/dashboard/profil", icon: User },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col h-[calc(100vh-64px)] sticky top-[64px]">
                <div className="p-6">
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
                </div>

                <div className="mt-auto p-6 border-t border-gray-200">
                    <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors w-full">
                        <LogOut size={20} />
                        Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 pb-safe">
                <nav className="flex justify-around items-center h-16 px-2">
                    {menuItems.slice(0, 4).map((item) => { // Show only first 4 items to save space
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
        </>
    );
}
