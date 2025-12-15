import { useEffect, useState } from 'react';

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
    order: number;
    parentId?: string | null;
    createdAt: string;
    parent?: Category | null;
    children?: Category[];
    _count?: {
        ads: number;
        children: number;
    };
}

interface UseCategoriesOptions {
    type?: 'all' | 'hierarchy' | 'parents';
    withCount?: boolean;
    parentId?: string;
}

interface UseCategoriesReturn {
    categories: Category[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useCategories(options: UseCategoriesOptions = {}): UseCategoriesReturn {
    const { type = 'hierarchy', withCount = true, parentId } = options;

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construire l'URL avec les paramètres
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (withCount) params.append('withCount', 'true');
            if (parentId) params.append('parentId', parentId);

            const url = `/api/categories?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
            } else {
                throw new Error(data.error || 'Erreur lors de la récupération des catégories');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [type, withCount, parentId]);

    return {
        categories,
        loading,
        error,
        refetch: fetchCategories,
    };
}

// Hook pour récupérer une seule catégorie
export function useCategory(idOrSlug: string) {
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/categories/${idOrSlug}`);

            if (!response.ok) {
               
                setCategory(null);
                 return;
            }


            const data = await response.json();

            if (data.success) {
                setCategory(data.data);
            } else {
                throw new Error(data.error || 'Erreur lors de la récupération de la catégorie');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            console.error('Error fetching category:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idOrSlug) {
            fetchCategory();
        }
    }, [idOrSlug]);

    return {
        category,
        loading,
        error,
        refetch: fetchCategory,
    };
}
