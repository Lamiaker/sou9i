"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log l'erreur côté client (visible uniquement en dev)
        // En production, on pourrait envoyer à un service d'analytics
        if (process.env.NODE_ENV === "development") {
            console.error("Page Error:", error);
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Icône animée */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <AlertTriangle className="w-12 h-12 text-white" />
                    </div>
                </div>

                {/* Contenu */}
                <h1 className="text-3xl font-bold text-slate-800 mb-3">
                    Oups ! Une erreur est survenue
                </h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Nous sommes désolés, quelque chose s'est mal passé.
                    <br />
                    Veuillez réessayer ou retourner à l'accueil.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Réessayer
                    </button>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
                    >
                        <Home className="w-5 h-5" />
                        Accueil
                    </Link>
                </div>

                {/* Bouton retour */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retourner à la page précédente
                </button>

                {/* Identifiant technique (optionnel, utile pour le support) */}
                {error.digest && (
                    <p className="mt-8 text-xs text-slate-400">
                        Code erreur : {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
