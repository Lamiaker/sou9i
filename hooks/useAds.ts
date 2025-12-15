import { useEffect, useState } from 'react';

export interface Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    images: string[];
    condition?: string | null;
    brand?: string | null;
    size?: string | null;
    status: string;
    views: number;
    deliveryAvailable: boolean;
    negotiable: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: string;
    userId: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    user?: {
        id: string;
        name: string | null;
        avatar: string | null;
        city: string | null;
        phone: string | null;
        isVerified: boolean;
        createdAt: string;
    };
    _count?: {
        favorites: number;
    };
}

export interface AdFilters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
    search?: string;
    status?: string;
    userId?: string;
}

interface UseAdsOptions {
    filters?: AdFilters;
    page?: number;
    limit?: number;
    enabled?: boolean; // Pour désactiver le fetch automatique
}

interface UseAdsReturn {
    ads: Ad[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    } | null;
    refetch: () => void;
}

export function useAds(options: UseAdsOptions = {}): UseAdsReturn {
    const {
        filters = {},
        page = 1,
        limit = 12,
        enabled = true
    } = options;

    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<UseAdsReturn['pagination']>(null);

    const fetchAds = async () => {
        if (!enabled) return;

        try {
            setLoading(true);
            setError(null);

            // Construire l'URL avec les paramètres
            const params = new URLSearchParams();

            // Filtres
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.location) params.append('location', filters.location);
            if (filters.condition) params.append('condition', filters.condition);
            if (filters.search) params.append('search', filters.search);
            if (filters.status) params.append('status', filters.status);
            if (filters.userId) params.append('userId', filters.userId);

            // Pagination
            params.append('page', page.toString());
            params.append('limit', limit.toString());

            const url = `/api/ads?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setAds(data.data);
                setPagination(data.pagination);
            } else {
                throw new Error(data.error || 'Erreur lors de la récupération des annonces');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Error fetching ads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, [
        filters.categoryId,
        filters.minPrice,
        filters.maxPrice,
        filters.location,
        filters.condition,
        filters.search,
        filters.status,
        filters.userId,
        page,
        limit,
        enabled,
    ]);

    return {
        ads,
        loading,
        error,
        pagination,
        refetch: fetchAds,
    };
}

// Hook pour récupérer une seule annonce
export function useAd(id: string | null) {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAd = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/ads/${id}`);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setAd(data.data);

                // Incrémenter les vues (dans un appel séparé pour ne pas bloquer)
                fetch(`/api/ads/${id}/views`, { method: 'POST' }).catch(console.error);
            } else {
                throw new Error(data.error || 'Erreur lors de la récupération de l\'annonce');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Error fetching ad:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAd();
    }, [id]);

    return {
        ad,
        loading,
        error,
        refetch: fetchAd,
    };
}
