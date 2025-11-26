import { useState, useMemo, useCallback } from 'react';

export function useFilter<T, F>(
    data: T[],
    initialFilters: F,
    filterLogic: (item: T, filters: F) => boolean
) {
    const [filters, setFilters] = useState<F>(initialFilters);

    const updateFilter = useCallback((key: keyof F, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const filteredData = useMemo(() => {
        return data.filter((item) => filterLogic(item, filters));
    }, [data, filters, filterLogic]);

    return {
        filters,
        setFilters,
        updateFilter,
        resetFilters,
        filteredData,
    };
}
