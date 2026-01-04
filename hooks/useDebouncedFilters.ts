import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook pour gérer des filtres avec debounce automatique sur les champs texte
 * Permet de réduire les requêtes API lors de la saisie
 * 
 * @param initialFilters - Valeurs initiales des filtres
 * @param onFiltersChange - Callback appelé quand les filtres changent (après debounce pour texte)
 * @param debounceMs - Délai de debounce pour les champs texte (défaut: 400ms)
 * @param textFields - Liste des clés qui sont des champs texte à debouncer
 * 
 * @example
 * const { filters, updateFilter, resetFilters, isPending } = useDebouncedFilters(
 *   { search: '', category: '', minPrice: 0 },
 *   (filters) => fetchData(filters),
 *   400,
 *   ['search'] // Seul 'search' sera debouncé
 * );
 * 
 * <input 
 *   value={filters.search} 
 *   onChange={(e) => updateFilter('search', e.target.value)} 
 * />
 * {isPending && <Spinner />}
 */
export function useDebouncedFilters<T extends Record<string, any>>(
    initialFilters: T,
    onFiltersChange?: (filters: T) => void,
    debounceMs: number = 400,
    textFields: (keyof T)[] = []
) {
    // État local des filtres (mise à jour immédiate pour l'UI)
    const [filters, setFilters] = useState<T>(initialFilters);

    // Extraire les valeurs des champs texte pour le debounce
    const textValues = textFields.reduce((acc, key) => {
        acc[key] = filters[key];
        return acc;
    }, {} as Partial<T>);

    // Debounce du JSON stringifié des valeurs texte
    const textValuesString = JSON.stringify(textValues);
    const debouncedTextValuesString = useDebounce(textValuesString, debounceMs);

    // Tracker si on est en attente d'un debounce
    const isPending = textValuesString !== debouncedTextValuesString;

    // Référence pour éviter d'appeler onFiltersChange au premier rendu
    const isFirstRender = useRef(true);
    const onFiltersChangeRef = useRef(onFiltersChange);

    // Garder la référence du callback à jour
    useEffect(() => {
        onFiltersChangeRef.current = onFiltersChange;
    }, [onFiltersChange]);

    // Appeler onFiltersChange quand les filtres debouncés changent
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (onFiltersChangeRef.current) {
            // Reconstruire les filtres avec les valeurs debouncées pour le texte
            const debouncedTextValues = JSON.parse(debouncedTextValuesString) as Partial<T>;
            const finalFilters = { ...filters };

            // Appliquer les valeurs debouncées pour les champs texte
            for (const key of textFields) {
                if (key in debouncedTextValues) {
                    (finalFilters as any)[key] = debouncedTextValues[key];
                }
            }

            onFiltersChangeRef.current(finalFilters);
        }
    }, [debouncedTextValuesString, filters, textFields]);

    // Méthode pour mettre à jour un filtre
    const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Méthode pour mettre à jour plusieurs filtres à la fois
    const updateFilters = useCallback((updates: Partial<T>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    }, []);

    // Méthode pour réinitialiser les filtres
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    // Méthode pour réinitialiser un filtre spécifique
    const resetFilter = useCallback(<K extends keyof T>(key: K) => {
        setFilters(prev => ({ ...prev, [key]: initialFilters[key] }));
    }, [initialFilters]);

    return {
        filters,
        updateFilter,
        updateFilters,
        resetFilters,
        resetFilter,
        isPending,
        setFilters,
    };
}

export default useDebouncedFilters;
