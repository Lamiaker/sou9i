import { useRef, useEffect, useCallback } from 'react';


export function useAbortableFetch() {
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup au démontage du composant
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    /**
     * Annule la requête en cours
     */
    const abort = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    /**
     * Vérifie si une erreur est due à une annulation
     */
    const isAborted = useCallback((error: unknown): boolean => {
        return error instanceof DOMException && error.name === 'AbortError';
    }, []);

    /**
     * Fetch avec gestion automatique de l'annulation
     * Annule toute requête précédente avant d'en lancer une nouvelle
     */
    const fetchWithAbort = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            // Annuler la requête précédente
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Créer un nouveau controller
            abortControllerRef.current = new AbortController();

            // Lancer la requête avec le signal
            return fetch(url, {
                ...options,
                signal: abortControllerRef.current.signal,
            });
        },
        []
    );

    return {
        fetchWithAbort,
        abort,
        isAborted,
    };
}

/**
 * Hook combinant debounce et abort pour les recherches
 * Pattern optimal pour les champs de recherche avec API
 * 
 * @param searchFn - Fonction de recherche à exécuter
 * @param delay - Délai de debounce en ms (par défaut: 300)
 * @returns Fonction de recherche optimisée
 * 
 * @example
 * const search = useDebouncedSearch(async (query, signal) => {
 *   const res = await fetch(`/api/search?q=${query}`, { signal });
 *   return res.json();
 * }, 500);
 * 
 * <input onChange={(e) => search(e.target.value)} />
 */
export function useDebouncedSearch<T>(
    searchFn: (query: string, signal: AbortSignal) => Promise<T>,
    delay: number = 300
) {
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const searchFnRef = useRef(searchFn);

    // Garder la référence de la fonction à jour
    useEffect(() => {
        searchFnRef.current = searchFn;
    }, [searchFn]);

    // Cleanup au démontage
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const search = useCallback(
        (query: string): Promise<T | null> => {
            return new Promise((resolve) => {
                // Annuler le timeout précédent
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                // Annuler la requête précédente
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // Si la requête est vide, résoudre immédiatement
                if (!query.trim()) {
                    resolve(null);
                    return;
                }

                // Debounce
                timeoutRef.current = setTimeout(async () => {
                    abortControllerRef.current = new AbortController();

                    try {
                        const result = await searchFnRef.current(
                            query,
                            abortControllerRef.current.signal
                        );
                        resolve(result);
                    } catch (error) {
                        // Ignorer les erreurs d'annulation
                        if (error instanceof DOMException && error.name === 'AbortError') {
                            resolve(null);
                        } else {
                            throw error;
                        }
                    }
                }, delay);
            });
        },
        [delay]
    );

    return search;
}

/**
 * Crée un AbortController avec timeout automatique
 * Utile pour les requêtes qui doivent avoir un timeout
 * 
 * @param timeoutMs - Timeout en millisecondes (par défaut: 10000)
 * @returns AbortController qui s'annule après le timeout
 * 
 * @example
 * const controller = createAbortControllerWithTimeout(5000);
 * fetch('/api/slow', { signal: controller.signal });
 */
export function createAbortControllerWithTimeout(
    timeoutMs: number = 10000
): AbortController {
    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    // Nettoyer le timeout si la requête se termine avant
    controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
    });

    return controller;
}
