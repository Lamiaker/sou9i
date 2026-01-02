import useSWR from 'swr';
import { useEffect, useState } from 'react';
import type {
    AdWithDetails,
    AdFiltersUI,
    PaginationInfo,
    UseDataOptions
} from '@/types';

// Réexporter les types pour compatibilité avec le code existant
export type Ad = AdWithDetails;
export type AdFilters = AdFiltersUI;

interface UseAdsOptions extends UseDataOptions {
    filters?: AdFilters;
    page?: number;
    limit?: number;
    isAdmin?: boolean;
}

export function useAds(options: UseAdsOptions = {}) {
    const {
        filters = {},
        page = 1,
        limit = 12,
        enabled = true,
        refreshInterval = 0,
        isAdmin = false
    } = options;

    const params = new URLSearchParams();
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.location) params.append('location', filters.location);
    if (filters.condition) params.append('condition', filters.condition);
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.moderationStatus) params.append('moderationStatus', filters.moderationStatus);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const baseUrl = isAdmin ? '/api/admin/ads' : '/api/ads';
    const url = enabled ? `${baseUrl}?${queryString}` : null;

    const { data, error, mutate, isValidating } = useSWR(
        url,
        {
            refreshInterval,
            revalidateOnFocus: true,
            dedupingInterval: 2000,
        }
    );

    return {
        ads: (data?.data as Ad[]) || [],
        loading: !data && !error,
        error: error ? (error instanceof Error ? error.message : 'Une erreur est survenue') : (data?.success === false ? data.error : null),
        pagination: data?.pagination || null,
        refetch: mutate,
        isValidating
    };
}

export function useAd(id: string | null, options: { refreshInterval?: number } = {}) {
    const { refreshInterval = 0 } = options;
    const url = id ? `/api/ads/${id}` : null;

    const { data, error, mutate, isValidating } = useSWR(
        url,
        {
            refreshInterval,
            revalidateOnFocus: true,
            onSuccess: (data) => {
                if (data.success && id) {
                    // Incrémenter les vues (fire and forget)
                    fetch(`/api/ads/${id}/views`, { method: 'POST' }).catch(console.error);
                }
            }
        }
    );

    return {
        ad: (data?.data as Ad) || null,
        loading: !data && !error,
        error: error ? (error instanceof Error ? error.message : 'Une erreur est survenue') : (data?.success === false ? data.error : null),
        refetch: mutate,
        isValidating
    };
}
