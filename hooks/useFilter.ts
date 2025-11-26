import { useState, useMemo, useCallback } from 'react';

export function useFilter<T>(
    data: T[],
    initialFilters: any,
    filterLogic: (item: T, filters: any) => boolean
) {
    const [filters, setFilters] = useState(initialFilters);

    const updateFilter = useCallback((key: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [key]: value }));
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
