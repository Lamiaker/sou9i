import { useState, useEffect, useCallback, useRef } from 'react';
import { useAds, type Ad, type AdFilters } from './useAds';

interface UseInfiniteAdsOptions {
    filters?: AdFilters;
    limit?: number;
    enabled?: boolean;
    isAdmin?: boolean;
}

interface UseInfiniteAdsReturn {
    /** Toutes les annonces chargées */
    ads: Ad[];
    /** Chargement en cours */
    loading: boolean;
    /** Erreur éventuelle */
    error: string | null;
    /** Indique s'il y a plus d'annonces à charger */
    hasMore: boolean;
    /** Charger la page suivante */
    loadMore: () => void;
    /** Réinitialiser et recharger depuis le début */
    reset: () => void;
    /** Page courante */
    page: number;
    /** Nombre total d'annonces */
    total: number;
    /** Nombre total de pages */
    totalPages: number;
    /** Recharger les données */
    refetch: () => void;
}

/**
 * Hook pour l'infinite scroll des annonces
 * Accumule les résultats au fur et à mesure du scroll
 * 
 * @example
 * const { ads, loading, hasMore, loadMore, reset } = useInfiniteAds({
 *   filters: { categoryId: 'xxx' },
 *   limit: 12,
 * });
 * 
 * <InfiniteScroll
 *   items={ads}
 *   renderItem={(ad) => <AdCard ad={ad} />}
 *   onLoadMore={loadMore}
 *   hasMore={hasMore}
 *   isLoading={loading}
 *   keyExtractor={(ad) => ad.id}
 * />
 */
export function useInfiniteAds(options: UseInfiniteAdsOptions = {}): UseInfiniteAdsReturn {
    const {
        filters = {},
        limit = 12,
        enabled = true,
        isAdmin = false,
    } = options;

    // État local pour la page et les éléments accumulés
    const [page, setPage] = useState(1);
    const [allAds, setAllAds] = useState<Ad[]>([]);
    const [isResetting, setIsResetting] = useState(false);

    // Tracker les filtres précédents pour détecter les changements
    const prevFiltersRef = useRef<string>('');
    const filtersString = JSON.stringify(filters);

    // Utiliser le hook useAds pour la page courante
    const { ads, loading, error, pagination, refetch } = useAds({
        filters,
        page,
        limit,
        enabled: enabled && !isResetting,
        isAdmin,
    });

    // Détecter les changements de filtres et réinitialiser
    useEffect(() => {
        if (filtersString !== prevFiltersRef.current) {
            prevFiltersRef.current = filtersString;
            // Reset si les filtres changent (sauf au premier rendu)
            if (prevFiltersRef.current !== '') {
                setIsResetting(true);
                setAllAds([]);
                setPage(1);
                setTimeout(() => setIsResetting(false), 0);
            }
        }
    }, [filtersString]);

    // Accumuler les annonces quand de nouvelles données arrivent
    useEffect(() => {
        if (ads.length === 0 || isResetting) return;

        if (page === 1) {
            // Première page - remplacer tout
            setAllAds(ads);
        } else {
            // Pages suivantes - ajouter sans doublons
            setAllAds(prev => {
                const existingIds = new Set(prev.map(ad => ad.id));
                const newAds = ads.filter(ad => !existingIds.has(ad.id));
                return [...prev, ...newAds];
            });
        }
    }, [ads, page, isResetting]);

    // Charger la page suivante
    const loadMore = useCallback(() => {
        if (pagination && page < pagination.totalPages && !loading) {
            setPage(p => p + 1);
        }
    }, [pagination, page, loading]);

    // Réinitialiser complètement
    const reset = useCallback(() => {
        setIsResetting(true);
        setAllAds([]);
        setPage(1);
        setTimeout(() => {
            setIsResetting(false);
            refetch();
        }, 0);
    }, [refetch]);

    const hasMore = pagination ? page < pagination.totalPages : false;
    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    return {
        ads: allAds,
        loading,
        error,
        hasMore,
        loadMore,
        reset,
        page,
        total,
        totalPages,
        refetch: reset,
    };
}

export default useInfiniteAds;
