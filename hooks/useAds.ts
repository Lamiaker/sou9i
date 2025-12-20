import useSWR from 'swr';
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
    moderationStatus?: string;
    rejectionReason?: string;
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
    moderationStatus?: string;
}

interface UseAdsOptions {
    filters?: AdFilters;
    page?: number;
    limit?: number;
    enabled?: boolean;
    refreshInterval?: number;
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
