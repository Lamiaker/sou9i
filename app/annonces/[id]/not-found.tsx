"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";

/**
 * Page 404 spécifique pour les annonces
 * Affichée quand une annonce n'existe pas
 */
export default function AdNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-lg w-full text-center">
                {/* Icon */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto border border-orange-200">
                        <span className="text-5xl">📦</span>
                    </div>
                </div>

                {/* Contenu */}
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                    Annonce introuvable
                </h1>
                <p className="text-slate-600 mb-8 leading-relaxed max-w-md mx-auto">
                    Cette annonce n'existe pas ou a été supprimée par son auteur.
                    Elle est peut-être déjà vendue !
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                    >
                        <Home className="w-5 h-5" />
                        Voir toutes les annonces
                    </Link>

                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
                    >
                        <Search className="w-5 h-5" />
                        Rechercher
                    </Link>
                </div>

                {/* Bouton retour */}
                <button
                    onClick={() => typeof window !== 'undefined' && window.history.back()}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retourner à la page précédente
                </button>
            </div>
        </div>
    );
}
