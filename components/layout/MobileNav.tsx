"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    Heart,
    MessageCircle,
    Menu,
    X,
    User,
    Settings,
    HelpCircle,
    Megaphone,
    LogOut,
    ChevronRight,
    Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

const mainMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Annonces", href: "/dashboard/annonces", icon: ShoppingBag },
    { name: "Favoris", href: "/favoris", icon: Heart },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
];

const moreMenuItems = [
    { name: "Mon profil", href: "/dashboard/profil", icon: User },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
    { name: "Aide & Support", href: "/dashboard/support", icon: HelpCircle },
    { name: "Publicité", href: "/dashboard/publicite", icon: Megaphone },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Ne pas afficher si l'utilisateur n'est pas connecté
    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await signOut({ callbackUrl: "/" });
    };

    const isMoreActive = moreMenuItems.some(item => pathname === item.href);

    return (
        <>
            {/* Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Bottom Sheet Menu */}
            <div
                className={`fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 lg:hidden transform transition-transform duration-300 ease-out pb-safe ${isMenuOpen ? "translate-y-0" : "translate-y-full"
                    }`}
            >
                <div className="p-4">
                    {/* Handle */}
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                    {/* Menu Title */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="space-y-1">
                        {moreMenuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={20} />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </Link>
                            );
                        })}

                        {/* Separator */}
                        <div className="border-t border-gray-100 my-2" />

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut size={20} />
                                <span className="font-medium">Déconnexion</span>
                            </div>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50 pb-safe">
                <nav className="flex justify-around items-center h-16 px-2">
                    {mainMenuItems.map((item) => {
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

                    {/* More Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMenuOpen || isMoreActive ? "text-primary" : "text-gray-500"
                            }`}
                    >
                        <Menu size={24} strokeWidth={isMenuOpen || isMoreActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </nav>
            </div>
        </>
    );
}
