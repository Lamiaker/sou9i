import { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rechercher des annonces | SweetLook',
    description: 'Trouvez exactement ce que vous cherchez sur SweetLook : mode, beauté, maison, services et plus en Algérie.',
};

/**
 * Page de recherche - Rendu dynamique
 * 
 * Cette page est dynamique car elle dépend des paramètres de recherche.
 * Le composant client est wrappé dans Suspense pour permettre le build.
 */
export const dynamic = 'force-dynamic';

// Skeleton pour le chargement
function SearchSkeleton() {
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters skeleton */}
                    <aside className="w-full lg:w-64">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                            <div className="space-y-4">
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </aside>

                    {/* Results skeleton */}
                    <main className="flex-1">
                        <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white rounded-xl h-[350px] animate-pulse">
                                    <div className="h-[200px] bg-gray-200 rounded-t-xl"></div>
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<SearchSkeleton />}>
            <SearchPageClient />
        </Suspense>
    );
}
