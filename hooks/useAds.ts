import useSWR from 'swr';
import { useEffect, useState, useRef, useCallback } from 'react';
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

/**
 * Fetcher avec AbortController pour annuler les requêtes obsolètes
 * Permet d'éviter les race conditions lors de la navigation rapide
 */
const createAbortableFetcher = () => {
    let abortController: AbortController | null = null;

    return async (url: string) => {
        // Annuler la requête précédente si elle existe
        if (abortController) {
            abortController.abort();
        }

        // Créer un nouveau controller
        abortController = new AbortController();

        try {
            const response = await fetch(url, {
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            // Ne pas propager les erreurs d'annulation
            if (error instanceof DOMException && error.name === 'AbortError') {
                // Retourner une promesse qui ne se résout jamais pour éviter les mises à jour d'état
                return new Promise(() => { });
            }
            throw error;
        }
    };
};

export function useAds(options: UseAdsOptions = {}) {
    const {
        filters = {},
        page = 1,
        limit = 12,
        enabled = true,
        refreshInterval = 0,
        isAdmin = false
    } = options;

    // Créer un fetcher stable avec AbortController
    const fetcherRef = useRef(createAbortableFetcher());

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
        fetcherRef.current,
        {
            refreshInterval,
            revalidateOnFocus: true,
            dedupingInterval: 2000,
            // Garder les données précédentes pendant le chargement des nouvelles
            keepPreviousData: true,
            // En cas d'erreur de réseau, réessayer
            errorRetryCount: 2,
            errorRetryInterval: 1000,
        }
    );

    return {
        ads: (data?.data as Ad[]) || [],
        loading: !data && !error,
        error: error ? (error instanceof Error ? error.message : 'Une erreur est survenue') : (data?.success === false ? data.error : null),
        pagination: data?.pagination || null,
        refetch: mutate,
        isValidating,
        // Indicateur si les données affichées sont des données précédentes
        isStale: isValidating && !!data,
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
