/**
 * Service de cache avec Redis pour les données fréquemment accédées
 * 
 * Ce service ajoute une couche de cache Redis au-dessus des services existants.
 * Il est particulièrement utile pour les données qui :
 * - Sont accédées très fréquemment (catégories, configs)
 * - Changent rarement
 * - Sont coûteuses à récupérer depuis la DB
 */

import { cacheGet, cacheSet, cacheDelete, cacheDeletePattern, isRedisAvailable } from './redis';
import { CategoryService } from '@/services';

// Types pour le cache
interface CachedCategory {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
}

interface CachedCategoryHierarchy extends CachedCategory {
    children: CachedCategory[];
    _count: {
        ads: number;
        children: number;
    };
}

// TTL en secondes
const CACHE_TTL = {
    CATEGORIES_ALL: 3600,           // 1 heure
    CATEGORIES_HIERARCHY: 3600,     // 1 heure
    CATEGORIES_TRENDING: 300,       // 5 minutes
    CATEGORIES_FOR_DROPDOWN: 86400, // 24 heures (change très rarement)
};

/**
 * Récupère les catégories hiérarchiques avec cache Redis
 */
export async function getCachedCategoriesHierarchy(): Promise<CachedCategoryHierarchy[]> {
    const cacheKey = 'categories:hierarchy';

    // Essayer de récupérer du cache Redis
    const cached = await cacheGet<CachedCategoryHierarchy[]>(cacheKey);
    if (cached) {
        return cached;
    }

    // Si pas en cache, récupérer de la DB
    const categories = await CategoryService.getCategoriesHierarchy();

    // Mettre en cache
    await cacheSet(cacheKey, categories, CACHE_TTL.CATEGORIES_HIERARCHY);

    return categories as CachedCategoryHierarchy[];
}

/**
 * Récupère toutes les catégories avec cache Redis
 */
export async function getCachedAllCategories() {
    const cacheKey = 'categories:all';

    const cached = await cacheGet(cacheKey);
    if (cached) {
        return cached;
    }

    const categories = await CategoryService.getAllCategories();
    await cacheSet(cacheKey, categories, CACHE_TTL.CATEGORIES_ALL);

    return categories;
}

/**
 * Récupère les catégories tendance avec cache Redis
 */
export async function getCachedTrendingCategories() {
    const cacheKey = 'categories:trending';

    const cached = await cacheGet(cacheKey);
    if (cached) {
        return cached;
    }

    const categories = await CategoryService.getTrendingCategories();
    await cacheSet(cacheKey, categories, CACHE_TTL.CATEGORIES_TRENDING);

    return categories;
}

/**
 * Récupère les catégories pour les dropdowns (format léger)
 */
export async function getCachedCategoriesForDropdown(): Promise<{
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
}[]> {
    const cacheKey = 'categories:dropdown';

    const cached = await cacheGet<{ id: string; name: string; slug: string; parentId: string | null }[]>(cacheKey);
    if (cached) {
        return cached;
    }

    // Récupérer uniquement les champs nécessaires pour les dropdowns
    const categories = await CategoryService.getAllCategories();
    const lightCategories = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parentId: cat.parentId,
    }));

    await cacheSet(cacheKey, lightCategories, CACHE_TTL.CATEGORIES_FOR_DROPDOWN);

    return lightCategories;
}

/**
 * Invalide le cache des catégories (à appeler après modification)
 */
export async function invalidateCategoriesCache(): Promise<void> {
    // Supprimer toutes les clés de cache liées aux catégories
    await cacheDeletePattern('categories:*');

    console.log('[Cache] Cache des catégories invalidé');
}

/**
 * Récupère les catégories parentes avec au moins une annonce active (cache Redis)
 */
export async function getCachedCategoriesWithAds(skip = 0, take = 4) {
    const cacheKey = `categories:with-ads:${skip}:${take}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
        return cached;
    }

    const categories = await CategoryService.getCategoriesWithAds({ skip, take });
    await cacheSet(cacheKey, categories, 300); // 5 minutes

    return categories;
}

/**
 * Invalide tout le cache (pour les cas extrêmes)
 */
export async function invalidateAllCache(): Promise<void> {
    await cacheDeletePattern('*');
    console.log('[Cache] Tout le cache a été invalidé');
}

/**
 * Vérifie si le cache Redis est disponible
 */
export async function isCacheAvailable(): Promise<boolean> {
    return isRedisAvailable();
}

/**
 * Préchauffe le cache (à utiliser au démarrage si voulu)
 */
export async function warmUpCache(): Promise<void> {
    console.log('[Cache] Préchauffage du cache...');

    try {
        // Précharger les catégories principales
        await getCachedCategoriesHierarchy();
        await getCachedTrendingCategories();
        await getCachedCategoriesForDropdown();

        console.log('[Cache] Préchauffage terminé ✓');
    } catch (error) {
        console.error('[Cache] Erreur lors du préchauffage:', error);
    }
}
