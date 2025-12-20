"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldX, LogOut, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function BannedPage() {
    const { data: session } = useSession();

    // Redirection si l'utilisateur n'est pas banni ou pas connecté
    useEffect(() => {
        if (session && !session.user.isBanned) {
            window.location.href = "/";
        }
    }, [session]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-20 animate-pulse"></div>

                    <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <ShieldX className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">Compte Suspendu</h1>
                        <p className="text-white/60 mb-8 leading-relaxed">
                            Votre accès à FemMarket a été restreint par l'administration.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Raison du blocage</p>
                            <p className="text-red-400 font-medium italic">
                                "{session?.user?.banReason || "Violation des conditions d'utilisation"}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="mailto:support@femmarket.dz"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                            >
                                <MessageCircle size={18} />
                                Contacter le support
                            </Link>

                            <button
                                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                                className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
                            >
                                <LogOut size={18} />
                                Se déconnecter
                            </button>
                        </div>

                        <p className="mt-8 text-xs text-white/30">
                            ID Support: {session?.user?.id}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
