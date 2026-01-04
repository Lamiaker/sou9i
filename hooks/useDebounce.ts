import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook pour debouncer une valeur
 * Retourne la valeur après un délai spécifié sans changement
 * 
 * @param value - Valeur à debouncer
 * @param delay - Délai en millisecondes (par défaut: 300ms)
 * @returns La valeur debouncée
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 * 
 * useEffect(() => {
 *   // Cette recherche ne se lance que 500ms après la dernière frappe
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Créer un timer qui met à jour la valeur après le délai
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: annuler le timer si la valeur change avant le délai
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Hook pour créer une fonction debouncée
 * Utile pour les callbacks comme onChange
 * 
 * @param callback - Fonction à debouncer
 * @param delay - Délai en millisecondes (par défaut: 300ms)
 * @returns Fonction debouncée stable (référence stable avec useCallback)
 * 
 * @example
 * const handleSearch = useDebouncedCallback((query: string) => {
 *   fetchResults(query);
 * }, 500);
 * 
 * <input onChange={(e) => handleSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 300
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Mettre à jour la référence du callback à chaque rendu
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup au démontage
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            // Annuler le timeout précédent
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Créer un nouveau timeout
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}

/**
 * Hook pour debouncer une valeur avec état de loading
 * Indique si une mise à jour est en attente
 * 
 * @param value - Valeur à debouncer
 * @param delay - Délai en millisecondes (par défaut: 300ms)
 * @returns Objet avec la valeur debouncée et l'état de pending
 * 
 * @example
 * const { debouncedValue, isPending } = useDebounceWithPending(search, 500);
 * 
 * {isPending && <Spinner />}
 */
export function useDebounceWithPending<T>(
    value: T,
    delay: number = 300
): { debouncedValue: T; isPending: boolean } {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        // Marquer comme pending dès que la valeur change
        if (value !== debouncedValue) {
            setIsPending(true);
        }

        const timer = setTimeout(() => {
            setDebouncedValue(value);
            setIsPending(false);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay, debouncedValue]);

    return { debouncedValue, isPending };
}
