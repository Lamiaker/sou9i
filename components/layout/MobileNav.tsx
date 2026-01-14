"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
    Home,
    LayoutDashboard,
    Plus,
    Heart,
    User,
    Settings,
    HelpCircle,
    Megaphone,
    LogOut,
    ChevronRight,
    Bell,
    X,
    MessageCircle,
    ShoppingBag
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/context/FavoritesContext";
import { signOut } from "next-auth/react";

const moreMenuItems = [
    { name: "Mes annonces", href: "/dashboard/annonces", icon: ShoppingBag },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
    { name: "Mon profil", href: "/dashboard/profil", icon: User },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
    { name: "Aide & Support", href: "/dashboard/support", icon: HelpCircle },
    { name: "Publicité", href: "/dashboard/publicite", icon: Megaphone },
];

export default function MobileNav() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const { data: session } = useSession();
    const { favorites } = useFavorites();
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

    // Définir les éléments de la barre de navigation
    const navItems = [
        { name: "Accueil", href: "/", icon: Home },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Favoris", href: "/favoris", icon: Heart },
    ];

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
                        <h3 className="text-lg font-semibold text-gray-900">Mon compte</h3>
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
                    {/* Accueil */}
                    <Link
                        href="/"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/" ? "text-primary" : "text-gray-500"
                            }`}
                    >
                        <Home size={22} strokeWidth={pathname === "/" ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Accueil</span>
                    </Link>

                    {/* Dashboard */}
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === "/dashboard" ? "text-primary" : "text-gray-500"
                            }`}
                    >
                        <LayoutDashboard size={22} strokeWidth={pathname === "/dashboard" ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Dashboard</span>
                    </Link>

                    {/* Bouton central - Déposer une annonce */}
                    <Link
                        href={session ? "/deposer" : "/connexion-requise"}
                        className="flex flex-col items-center justify-center -mt-4"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-4 border-white">
                            <Plus size={24} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-semibold text-gray-600 mt-1">Publier</span>
                    </Link>

                    {/* Favoris */}
                    <Link
                        href="/favoris"
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${pathname === "/favoris" ? "text-primary" : "text-gray-500"
                            }`}
                    >
                        <div className="relative">
                            <Heart size={22} strokeWidth={pathname === "/favoris" ? 2.5 : 2} />
                            {favorites.length > 0 && (
                                <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                                    {favorites.length > 9 ? '9+' : favorites.length}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium">Favoris</span>
                    </Link>

                    {/* Profil / Menu */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMenuOpen || isMoreActive ? "text-primary" : "text-gray-500"
                            }`}
                    >
                        <User size={22} strokeWidth={isMenuOpen || isMoreActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">Profil</span>
                    </button>
                </nav>
            </div>
        </>
    );
}
