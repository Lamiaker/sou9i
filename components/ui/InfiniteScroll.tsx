"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps<T> {
    /** Liste des éléments à afficher */
    items: T[];
    /** Fonction pour rendre chaque élément */
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Callback pour charger plus d'éléments */
    onLoadMore: () => void;
    /** Indique s'il y a plus d'éléments à charger */
    hasMore: boolean;
    /** Indique si le chargement est en cours */
    isLoading: boolean;
    /** Classes CSS du conteneur */
    className?: string;
    /** Classes CSS de la grille d'éléments */
    gridClassName?: string;
    /** Distance en pixels avant la fin pour déclencher le chargement */
    threshold?: number;
    /** Message quand il n'y a plus d'éléments */
    endMessage?: React.ReactNode;
    /** Message quand la liste est vide */
    emptyMessage?: React.ReactNode;
    /** Clé unique pour chaque élément */
    keyExtractor: (item: T, index: number) => string;
    /** Désactiver l'infinite scroll (utile pour basculer vers pagination classique) */
    disabled?: boolean;
}

/**
 * Composant Infinite Scroll optimisé pour mobile
 * Utilise IntersectionObserver pour une performance optimale
 * 
 * @example
 * <InfiniteScroll
 *   items={ads}
 *   renderItem={(ad) => <AdCard ad={ad} />}
 *   onLoadMore={() => setPage(p => p + 1)}
 *   hasMore={pagination.page < pagination.totalPages}
 *   isLoading={loading}
 *   keyExtractor={(ad) => ad.id}
 * />
 */
export default function InfiniteScroll<T>({
    items,
    renderItem,
    onLoadMore,
    hasMore,
    isLoading,
    className = '',
    gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6',
    threshold = 200,
    endMessage,
    emptyMessage,
    keyExtractor,
    disabled = false,
}: InfiniteScrollProps<T>) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    // Callback quand l'élément sentinel devient visible
    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            setIsIntersecting(entry.isIntersecting);

            if (entry.isIntersecting && hasMore && !isLoading && !disabled) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore, disabled]
    );

    // Configurer l'IntersectionObserver
    useEffect(() => {
        if (disabled) return;

        const options: IntersectionObserverInit = {
            root: null, // viewport
            rootMargin: `${threshold}px`,
            threshold: 0,
        };

        observerRef.current = new IntersectionObserver(handleIntersection, options);

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleIntersection, threshold, disabled]);

    // Re-observer quand le ref change
    useEffect(() => {
        if (disabled) return;

        if (observerRef.current && loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }
    }, [items.length, disabled]);

    // Liste vide
    if (items.length === 0 && !isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
                {emptyMessage || (
                    <div className="text-center">
                        <p className="text-gray-500 text-lg">Aucun élément trouvé</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Essayez de modifier vos filtres
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Grille d'éléments */}
            <div className={gridClassName}>
                {items.map((item, index) => (
                    <div key={keyExtractor(item, index)}>
                        {renderItem(item, index)}
                    </div>
                ))}
            </div>

            {/* Sentinel pour déclencher le chargement */}
            <div
                ref={loadMoreRef}
                className="w-full py-8 flex justify-center"
                aria-hidden="true"
            >
                {isLoading && (
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-sm">Chargement...</span>
                    </div>
                )}

                {!isLoading && hasMore && (
                    <button
                        onClick={onLoadMore}
                        className="px-6 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                        aria-label="Charger plus d'éléments"
                    >
                        Charger plus
                    </button>
                )}

                {!hasMore && items.length > 0 && (
                    <div className="text-center text-gray-400 text-sm">
                        {endMessage || "Vous avez tout vu ! 🎉"}
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Hook pour gérer l'état de l'infinite scroll
 * Accumule les éléments au fur et à mesure du chargement
 * 
 * @example
 * const { items, loadMore, hasMore, reset } = useInfiniteScroll(
 *   ads,
 *   pagination.totalPages,
 *   pagination.page
 * );
 */
export function useInfiniteScroll<T>(
    newItems: T[],
    totalPages: number,
    currentPage: number,
    keyExtractor?: (item: T) => string
) {
    const [allItems, setAllItems] = useState<T[]>([]);
    const [page, setPage] = useState(1);
    const prevPageRef = useRef(currentPage);

    // Accumuler les éléments quand de nouveaux arrivent
    useEffect(() => {
        if (newItems.length === 0) return;

        if (currentPage === 1) {
            // Première page - remplacer tout
            setAllItems(newItems);
        } else if (currentPage > prevPageRef.current) {
            // Page suivante - ajouter les nouveaux éléments
            setAllItems(prev => {
                // Éviter les doublons si keyExtractor est fourni
                if (keyExtractor) {
                    const existingKeys = new Set(prev.map(keyExtractor));
                    const uniqueNewItems = newItems.filter(item => !existingKeys.has(keyExtractor(item)));
                    return [...prev, ...uniqueNewItems];
                }
                return [...prev, ...newItems];
            });
        }
        prevPageRef.current = currentPage;
    }, [newItems, currentPage, keyExtractor]);

    // Charger la page suivante
    const loadMore = useCallback(() => {
        if (page < totalPages) {
            setPage(p => p + 1);
        }
    }, [page, totalPages]);

    // Réinitialiser (par exemple après un changement de filtre)
    const reset = useCallback(() => {
        setAllItems([]);
        setPage(1);
        prevPageRef.current = 0;
    }, []);

    return {
        items: allItems,
        page,
        setPage,
        loadMore,
        hasMore: page < totalPages,
        reset,
    };
}
