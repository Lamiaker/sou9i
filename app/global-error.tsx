"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

/**
 * Global Error Boundary - Capture les erreurs au niveau root layout
 * Cette page doit être autonome car le layout peut avoir crashé
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log l'erreur critique
        if (process.env.NODE_ENV === "development") {
            console.error("Global Error:", error);
        }
    }, [error]);

    return (
        <html lang="fr">
            <body className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    {/* Effet de glow */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-red-600/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative w-28 h-28 bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-red-600/40 border border-red-500/30">
                            <AlertOctagon className="w-14 h-14 text-white" />
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl font-bold text-white mb-4">
                        Erreur critique
                    </h1>
                    <p className="text-slate-400 mb-8 leading-relaxed text-lg">
                        L'application a rencontré un problème inattendu.
                        <br />
                        Nos équipes sont informées.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => reset()}
                            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-2xl hover:from-red-500 hover:to-rose-500 transition-all duration-300 shadow-lg shadow-red-600/30"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Recharger l'application
                        </button>

                        <a
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                        >
                            Retourner à l'accueil
                        </a>
                    </div>

                    {/* Code erreur pour le support */}
                    {error.digest && (
                        <div className="mt-10 p-4 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">
                                Si le problème persiste, contactez le support avec ce code :
                            </p>
                            <code className="text-sm text-red-400 font-mono">
                                {error.digest}
                            </code>
                        </div>
                    )}
                </div>
            </body>
        </html>
    );
}
