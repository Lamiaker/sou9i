"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft, HelpCircle } from "lucide-react";

/**
 * Page 404 personnalisée
 * Affichée quand une route n'existe pas
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                {/* Illustration 404 */}
                <div className="relative mb-8">
                    {/* Cercle décoratif */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-2xl"></div>

                    {/* Numéro 404 stylisé */}
                    <div className="relative">
                        <span className="text-[120px] sm:text-[160px] font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-none">
                            404
                        </span>
                    </div>
                </div>

                {/* Contenu */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    Page introuvable
                </h1>
                <p className="text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                    Vérifiez l'URL ou utilisez les options ci-dessous.
                </p>

                {/* Actions principales */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                        <Home className="w-5 h-5" />
                        Retour à l'accueil
                    </Link>

                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
                    >
                        <Search className="w-5 h-5" />
                        Rechercher
                    </Link>
                </div>

                {/* Liens utiles */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                    >
                        Voir les catégories
                    </Link>
                    <span className="text-slate-300">•</span>
                    <Link
                        href="/faq"
                        className="inline-flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Aide
                    </Link>
                </div>

                {/* Bouton retour */}
                <button
                    onClick={() => typeof window !== 'undefined' && window.history.back()}
                    className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retourner à la page précédente
                </button>
            </div>
        </div>
    );
}
