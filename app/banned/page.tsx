"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldX, LogOut, MessageCircle, Mail, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";

const SUPPORT_EMAIL = "support@sweetlook.dz";

export default function BannedPage() {
    const { data: session } = useSession();
    const [showContact, setShowContact] = useState(false);
    const [copied, setCopied] = useState(false);

    // Redirection si l'utilisateur n'est pas banni ou pas connecté
    useEffect(() => {
        if (session && !session.user.isBanned) {
            window.location.href = "/";
        }
    }, [session]);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erreur de copie:", err);
        }
    };

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
                            Votre accès à SweetLook a été restreint par l&apos;administration.
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Raison du blocage</p>
                            <p className="text-red-400 font-medium italic">
                                &quot;{session?.user?.banReason || "Violation des conditions d'utilisation"}&quot;
                            </p>
                        </div>

                        {/* Section Contact Support */}
                        {showContact ? (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 mb-6 animate-in fade-in duration-300">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <p className="text-blue-400 font-semibold">Contactez-nous par email</p>
                                </div>

                                <p className="text-white/60 text-sm mb-4">
                                    Envoyez un email à l&apos;adresse ci-dessous en expliquant votre situation.
                                    N&apos;oubliez pas de mentionner votre ID Support.
                                </p>

                                {/* Email avec bouton copier */}
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                                    <span className="flex-1 text-white font-mono text-sm truncate">
                                        {SUPPORT_EMAIL}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyEmail}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${copied
                                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                                            }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={14} />
                                                Copié !
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={14} />
                                                Copier
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Lien mailto */}
                                <a
                                    href={`mailto:${SUPPORT_EMAIL}?subject=Demande de débannissement - ID: ${session?.user?.id || 'N/A'}&body=Bonjour,%0A%0AJe souhaite contester ma suspension.%0A%0AMon ID Support: ${session?.user?.id || 'N/A'}%0A%0ARaison de ma demande:%0A`}
                                    className="block mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all text-sm"
                                >
                                    Ouvrir mon application email
                                </a>

                                <button
                                    type="button"
                                    onClick={() => setShowContact(false)}
                                    className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => setShowContact(true)}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                                >
                                    <MessageCircle size={18} />
                                    Contacter le support
                                </button>

                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/20"
                                >
                                    <LogOut size={18} />
                                    Se déconnecter
                                </button>
                            </div>
                        )}

                        {!showContact && (
                            <p className="mt-8 text-xs text-white/30">
                                ID Support: {session?.user?.id}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
