"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    AlertTriangle,
    FolderTree,
    ChevronLeft,
    ChevronRight,
    Shield,
    LogOut,
    Menu,
    X,
    Search,
    HelpCircle,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";

const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Recherche", href: "/admin/search", icon: Search },
    { name: "Annonces", href: "/admin/ads", icon: ShoppingBag },
    { name: "Signalements", href: "/admin/reports", icon: AlertTriangle },
    { name: "Catégories", href: "/admin/categories", icon: FolderTree },
    { name: "Support", href: "/admin/support", icon: HelpCircle },
];

export default function AdminLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirect if not admin
    useEffect(() => {
        if (status === "authenticated" && session?.user?.role !== "ADMIN") {
            router.push("/");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-white/70 text-sm">Chargement...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated" || session?.user?.role !== "ADMIN") {
        return null;
    }

    return (
        <ToastProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
                    <div className="flex items-center justify-between px-4 h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-white">Admin Panel</span>
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-white/70 hover:text-white transition-colors"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                <aside
                    className={`lg:hidden fixed top-16 left-0 bottom-0 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/admin" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-white border border-cyan-500/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon size={20} className={isActive ? "text-cyan-400" : ""} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            Déconnexion
                        </button>
                    </div>
                </aside>

                {/* Desktop Sidebar */}
                <aside
                    className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-slate-900/50 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${sidebarCollapsed ? "w-20" : "w-72"
                        }`}
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 p-6 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="overflow-hidden">
                                <h1 className="font-bold text-white text-lg">FemMarket</h1>
                                <p className="text-xs text-white/50">Administration</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== "/admin" && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive
                                        ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-white border border-cyan-500/30"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <item.icon size={20} className={`flex-shrink-0 ${isActive ? "text-cyan-400" : ""}`} />
                                    {!sidebarCollapsed && item.name}

                                    {/* Tooltip for collapsed state */}
                                    {sidebarCollapsed && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                            {item.name}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Collapse Button */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-cyan-600 transition-colors"
                    >
                        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-white/10">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold text-sm">
                                        {session?.user?.name?.charAt(0) || "A"}
                                    </span>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-white text-sm font-medium truncate">
                                        {session?.user?.name || "Admin"}
                                    </p>
                                    <p className="text-white/50 text-xs truncate">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </div>
                        )}
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 ${sidebarCollapsed ? "justify-center" : ""
                                }`}
                        >
                            <LogOut size={20} />
                            {!sidebarCollapsed && "Déconnexion"}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={`transition-all duration-300 pt-16 lg:pt-0 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
                        }`}
                >
                    <div className="p-4 lg:p-8 min-h-screen">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    );
}
