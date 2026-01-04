"use client";

/**
 * Skeleton loading pour le composant de pagination
 * Affiche un placeholder pendant le chargement des données
 */
export default function PaginationSkeleton({
    className = '',
    showItemsPerPage = false,
}: {
    className?: string;
    showItemsPerPage?: boolean;
}) {
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-6 ${className}`}>
            {/* Info sur les éléments affichés - Skeleton */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Sélecteur d'éléments par page - Skeleton */}
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">|</span>
                        <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                )}
            </div>

            {/* Contrôles de pagination - Skeleton */}
            <div className="flex items-center gap-1">
                {/* Première page */}
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />

                {/* Page précédente */}
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />

                {/* Numéros de pages */}
                <div className="flex items-center gap-1 mx-1">
                    <div className="w-9 h-9 bg-gray-300 rounded-lg animate-pulse" />
                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mx-1" />
                    <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                {/* Page suivante */}
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />

                {/* Dernière page */}
                <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        </div>
    );
}

/**
 * Skeleton pour la pagination admin (thème sombre)
 */
export function AdminPaginationSkeleton({
    className = '',
    showItemsPerPage = true,
}: {
    className?: string;
    showItemsPerPage?: boolean;
}) {
    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 ${className}`}>
            {/* Info sur les éléments affichés - Skeleton */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-white/20 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-white/10 rounded animate-pulse" />
                </div>

                {/* Sélecteur d'éléments par page - Skeleton */}
                {showItemsPerPage && (
                    <div className="flex items-center gap-2">
                        <span className="text-white/40 text-sm">|</span>
                        <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
                    </div>
                )}
            </div>

            {/* Contrôles de pagination - Skeleton */}
            <div className="flex items-center gap-1">
                {/* Boutons navigation */}
                <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
                <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />

                {/* Numéros de pages */}
                <div className="flex items-center gap-1 mx-1">
                    <div className="w-9 h-9 bg-white/20 rounded-lg animate-pulse" />
                    <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
                    <div className="w-4 h-4 bg-white/10 rounded animate-pulse mx-1" />
                    <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
                </div>

                {/* Boutons navigation */}
                <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
                <div className="w-9 h-9 bg-white/5 rounded-lg animate-pulse" />
            </div>
        </div>
    );
}
