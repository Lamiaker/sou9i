import { Suspense } from 'react';
import { Metadata } from 'next';
import { Heart } from 'lucide-react';
import FavorisClient from '@/components/favorites/FavorisClient';



export const metadata: Metadata = {
    title: 'Mes Favoris | SweetLook',
    description: 'Retrouvez toutes vos annonces favorites sauvegardées sur SweetLook.',
    robots: {
        index: false, // Page personnalisée, pas besoin d'indexer
        follow: true,
    },
};

// Skeleton SSR pour un affichage instantané
function FavorisSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header skeleton */}
                <div className="mb-8">
                    <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
                </div>

                {/* Grid skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-48 bg-gray-200 animate-pulse"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Loading indicator */}
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Heart className="w-5 h-5 animate-pulse" />
                        <span>Chargement de vos favoris...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FavorisPage() {
    return (
        <Suspense fallback={<FavorisSkeleton />}>
            <FavorisClient />
        </Suspense>
    );
}
