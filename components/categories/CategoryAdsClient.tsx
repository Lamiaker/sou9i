"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import AdCard from "@/components/ui/AdCard";
import SimpleSelect from "@/components/ui/SimpleSelect";
import Pagination from "@/components/ui/Pagination";
import InfiniteScroll from "@/components/ui/InfiniteScroll";
import { usePathname, useSearchParams } from "next/navigation";
import type { PaginationInfo } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Catégorie avec enfants pour l'affichage dans le composant
 */
interface CategoryForDisplay {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
    parent?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    children?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

/**
 * Annonce simplifiée pour l'affichage dans la grille
 */
interface AdForGrid {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    images: string[];
    categoryId: string;
    status: string;
    createdAt: string;
}

interface CategoryAdsClientProps {
    category: CategoryForDisplay;
    initialAds: AdForGrid[];
    pagination?: PaginationInfo;
}

export default function CategoryAdsClient({ category, initialAds, pagination: initialPagination }: CategoryAdsClientProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Récupérer la page depuis l'URL
    const pageInUrl = Number(searchParams?.get('page')) || 1;
    const limit = initialPagination?.limit || 12;

    // States pour les filtres
    const [ads, setAds] = useState<AdForGrid[]>(initialAds);
    const [loading, setLoading] = useState(false);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');
    const [showAllSubcategories, setShowAllSubcategories] = useState(false);

    // ===== Infinite Scroll pour mobile =====
    const [isMobile, setIsMobile] = useState(false);
    const [infiniteAds, setInfiniteAds] = useState<AdForGrid[]>(initialAds);
    const [currentPage, setCurrentPage] = useState(pageInUrl);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalPages, setTotalPages] = useState(initialPagination?.totalPages || 1);
    const [totalAds, setTotalAds] = useState(initialPagination?.total || 0);

    // Debounce des filtres de prix et localisation
    const debouncedPriceMin = useDebounce(priceMin, 400);
    const debouncedPriceMax = useDebounce(priceMax, 400);
    const debouncedLocation = useDebounce(locationFilter, 400);

    // Constante pour le nombre max de sous-catégories affichées par défaut
    const MAX_VISIBLE_SUBCATEGORIES = 6;

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Mettre à jour les annonces quand initialAds change (ex: changement de catégorie via route)
    useEffect(() => {
        if (pageInUrl === 1 && !selectedSubcategory && !debouncedPriceMin && !debouncedPriceMax && !debouncedLocation) {
            setAds(initialAds);
            setInfiniteAds(initialAds);
            setCurrentPage(1);
            setTotalPages(initialPagination?.totalPages || 1);
            setTotalAds(initialPagination?.total || 0);
        }
    }, [initialAds, initialPagination, pageInUrl]);

    // Récupérer les annonces quand les filtres OU la page changent
    useEffect(() => {
        // Ne pas fetcher si on est sur la page 1 et sans filtres (on a déjà les données via ISR)
        if (pageInUrl === 1 && !selectedSubcategory && !debouncedPriceMin && !debouncedPriceMax && !debouncedLocation) {
            return;
        }

        const fetchFilteredAds = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('categoryId', category.id);
                if (selectedSubcategory) params.append('subcategoryId', selectedSubcategory);
                if (debouncedPriceMin) params.append('minPrice', debouncedPriceMin);
                if (debouncedPriceMax) params.append('maxPrice', debouncedPriceMax);
                if (debouncedLocation) params.append('location', debouncedLocation);
                params.append('status', 'active');

                // Ajouter la page seulement si on est pas en mode mobile (l'infinite scroll gère sa propre page)
                if (!isMobile) {
                    params.append('page', pageInUrl.toString());
                    params.append('limit', limit.toString());
                }

                const response = await fetch(`/api/ads?${params.toString()}`);
                const data = await response.json();

                if (data.success) {
                    const newAds = Array.isArray(data.data) ? data.data : [];
                    setAds(newAds);
                    if (!isMobile) {
                        setInfiniteAds(newAds);
                        setCurrentPage(pageInUrl);
                    }
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages || 1);
                        setTotalAds(data.pagination.total || newAds.length);
                    }
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredAds();
    }, [category.id, selectedSubcategory, debouncedPriceMin, debouncedPriceMax, debouncedLocation, pageInUrl, isMobile, limit]);

    // ===== Fonction pour charger plus d'annonces (Infinite Scroll) =====
    const loadMoreAds = useCallback(async () => {
        if (loadingMore || currentPage >= totalPages) return;

        setLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            const params = new URLSearchParams();
            params.append('categoryId', category.id);
            if (selectedSubcategory) params.append('subcategoryId', selectedSubcategory);
            if (debouncedPriceMin) params.append('minPrice', debouncedPriceMin);
            if (debouncedPriceMax) params.append('maxPrice', debouncedPriceMax);
            if (debouncedLocation) params.append('location', debouncedLocation);
            params.append('status', 'active');
            params.append('page', nextPage.toString());
            params.append('limit', '12');

            const response = await fetch(`/api/ads?${params.toString()}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Ajouter les nouvelles annonces sans doublons
                setInfiniteAds(prev => {
                    const existingIds = new Set(prev.map(ad => ad.id));
                    const newAds = data.data.filter((ad: AdForGrid) => !existingIds.has(ad.id));
                    return [...prev, ...newAds];
                });
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error('Error loading more ads:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [currentPage, totalPages, loadingMore, category.id, selectedSubcategory, debouncedPriceMin, debouncedPriceMax, debouncedLocation]);

    // Trier les annonces côté client
    const sortedAds = useMemo(() => {
        const result = [...ads];
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'recent':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return result;
    }, [ads, sortBy]);

    // Trier les annonces infinies (pour mobile)
    const sortedInfiniteAds = useMemo(() => {
        const result = [...infiniteAds];
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'recent':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return result;
    }, [infiniteAds, sortBy]);

    const hasFilters = selectedSubcategory || priceMin || priceMax || locationFilter;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <button
                className="lg:hidden flex items-center justify-center gap-2 w-full bg-white p-3 rounded-xl shadow-sm border border-gray-200 font-semibold text-gray-700"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={20} />
                {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            </button>

            {/* Sidebar Filters */}
            <aside className={`w-full lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Sous-catégories */}
                {category.children && category.children.length > 0 && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <SlidersHorizontal size={18} />
                            Sous-catégories
                            <span className="text-xs text-gray-400 font-normal">({category.children.length})</span>
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="subcategory"
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                    checked={selectedSubcategory === null}
                                    onChange={() => setSelectedSubcategory(null)}
                                />
                                <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === null ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                    Tout voir
                                </span>
                            </label>

                            {/* Afficher les sous-catégories avec limite */}
                            {(showAllSubcategories
                                ? category.children
                                : category.children.slice(0, MAX_VISIBLE_SUBCATEGORIES)
                            ).map((child) => (
                                <label key={child.id} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="subcategory"
                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                        checked={selectedSubcategory === child.id}
                                        onChange={() => setSelectedSubcategory(child.id)}
                                    />
                                    <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === child.id ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {child.name}
                                    </span>
                                </label>
                            ))}

                            {/* Bouton Voir plus / Voir moins */}
                            {category.children.length > MAX_VISIBLE_SUBCATEGORIES && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                                    className="w-full mt-3 py-2 px-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    {showAllSubcategories ? (
                                        <>
                                            <span>Voir moins</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            <span>Voir plus ({category.children.length - MAX_VISIBLE_SUBCATEGORIES})</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Price Filter */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Prix (DZD)</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                    </div>
                </div>

                {/* Location Filter */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Localisation</h3>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Ville ou Wilaya"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                    </div>
                </div>

                {/* Reset Filters */}
                {hasFilters && (
                    <button
                        onClick={() => {
                            setSelectedSubcategory(null);
                            setPriceMin('');
                            setPriceMax('');
                            setLocationFilter('');
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Results Count & Sort */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 text-sm">
                        {loading ? (
                            'Chargement...'
                        ) : (
                            <>
                                <strong>{isMobile ? infiniteAds.length : sortedAds.length}</strong>
                                {isMobile && totalAds > infiniteAds.length && ` sur ${totalAds}`}
                                {' '}annonce{(isMobile ? infiniteAds.length : sortedAds.length) > 1 ? 's' : ''}
                                {' '}trouvée{(isMobile ? infiniteAds.length : sortedAds.length) > 1 ? 's' : ''}
                            </>
                        )}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Trier par:</span>
                        <SimpleSelect
                            value={sortBy}
                            onChange={(value) => setSortBy(value as any)}
                            options={[
                                { value: "recent", label: "Plus récents" },
                                { value: "price-asc", label: "Prix croissant" },
                                { value: "price-desc", label: "Prix décroissant" },
                            ]}
                        />
                    </div>
                </div>

                {/* Ads Grid - Infinite Scroll sur mobile, Grid + Pagination sur desktop */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                                <div className="aspect-[4/3] bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isMobile ? (
                    /* ===== MOBILE: Infinite Scroll ===== */
                    <InfiniteScroll<AdForGrid>
                        items={sortedInfiniteAds}
                        renderItem={(ad: AdForGrid) => (
                            <AdCard
                                id={ad.id}
                                title={ad.title}
                                price={ad.price}
                                images={ad.images}
                                location={ad.location}
                                createdAt={ad.createdAt}
                            />
                        )}
                        onLoadMore={loadMoreAds}
                        hasMore={currentPage < totalPages}
                        isLoading={loadingMore}
                        keyExtractor={(ad: AdForGrid) => ad.id}
                        gridClassName="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        threshold={300}
                        endMessage={
                            <div className="text-center py-4">
                                <span className="text-xl">🎉</span>
                                <p className="text-gray-400 text-sm mt-1">
                                    Vous avez tout vu !
                                </p>
                            </div>
                        }
                        emptyMessage={
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Filter size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Aucune annonce trouvée</h3>
                                <p className="text-gray-500 mt-2">
                                    {hasFilters
                                        ? "Essayez de changer les filtres."
                                        : "Aucune annonce disponible pour le moment."}
                                </p>
                            </div>
                        }
                    />
                ) : sortedAds.length > 0 ? (
                    /* ===== DESKTOP: Grid classique ===== */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedAds.map((ad) => (
                            <AdCard
                                key={ad.id}
                                id={ad.id}
                                title={ad.title}
                                price={ad.price}
                                images={ad.images}
                                location={ad.location}
                                createdAt={ad.createdAt}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Aucune annonce trouvée</h3>
                        <p className="text-gray-500 mt-2">
                            {hasFilters
                                ? 'Essayez de changer les filtres ou revenez plus tard.'
                                : "Aucune annonce n'est disponible dans cette catégorie pour le moment."}
                        </p>
                    </div>
                )}

                {/* Pagination - Uniquement sur desktop */}
                {!isMobile && initialPagination && initialPagination.totalPages > 1 && !hasFilters && (
                    <Pagination
                        pagination={initialPagination}
                        basePath={pathname || `/categories/${category.slug}`}
                        showItemsPerPage={true}
                    />
                )}
            </main>
        </div>
    );
}

