// ============================================
// Helpers pour la gestion des produits
// ============================================

import { Product, Ad, Categorie } from "@/types";
import { categories } from "@/lib/data/categories";
import {
    gateauxProducts,
    decorationProducts,
    beauteProducts,
    enfantProducts
} from "@/lib/data/featuredCategories";

/**
 * Assigne des sous-catégories aux produits pour la démo
 */
export const assignSubcategories = (products: any[], categoryName: string): Ad[] => {
    const category = categories.find(c => c.name === categoryName);
    const subcats = category?.sousCategories.map(s => s.titre) || [];

    return products.map((p, index) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        location: p.location || "Algérie",
        image: p.photos?.[0] || p.image || "https://via.placeholder.com/300",
        category: categoryName,
        subcategory: subcats.length > 0 ? subcats[index % subcats.length] : "Autre",
        date: p.postedTime || "Récemment",
        description: p.description,
        seller: p.seller,
    }));
};

/**
 * Récupère toutes les annonces (données mockées)
 */
export const getAllAds = (): Ad[] => {
    return [
        ...assignSubcategories(gateauxProducts, "Gâteaux & Pâtisserie"),
        ...assignSubcategories(decorationProducts, "Décoration & Événements"),
        ...assignSubcategories(beauteProducts, "Mode & Beauté"),
        ...assignSubcategories(enfantProducts, "Bébé & Enfants"),
    ];
};

/**
 * Filtre les annonces par catégorie
 */
export const getAdsByCategory = (categoryName: string): Ad[] => {
    const allAds = getAllAds();
    return allAds.filter(ad => ad.category === categoryName);
};

/**
 * Filtre les annonces par sous-catégorie
 */
export const getAdsBySubcategory = (categoryName: string, subcategoryName: string): Ad[] => {
    const categoryAds = getAdsByCategory(categoryName);
    return categoryAds.filter(ad => ad.subcategory === subcategoryName);
};

/**
 * Récupère une annonce par son ID
 */
export const getAdById = (id: string): Ad | undefined => {
    const allAds = getAllAds();
    return allAds.find(ad => ad.id === id);
};

/**
 * Recherche des annonces par mot-clé
 */
export const searchAds = (query: string): Ad[] => {
    const allAds = getAllAds();
    const lowerQuery = query.toLowerCase();

    return allAds.filter(ad =>
        ad.title.toLowerCase().includes(lowerQuery) ||
        ad.description?.toLowerCase().includes(lowerQuery) ||
        ad.category.toLowerCase().includes(lowerQuery) ||
        ad.subcategory.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Filtre les annonces selon plusieurs critères
 */
export const filterAds = (filters: {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
}): Ad[] => {
    let ads = getAllAds();

    if (filters.category) {
        ads = ads.filter(ad => ad.category === filters.category);
    }

    if (filters.subcategory) {
        ads = ads.filter(ad => ad.subcategory === filters.subcategory);
    }

    if (filters.minPrice !== undefined) {
        ads = ads.filter(ad => {
            const price = parseFloat(ad.price.replace(/[^0-9.]/g, ''));
            return price >= filters.minPrice!;
        });
    }

    if (filters.maxPrice !== undefined) {
        ads = ads.filter(ad => {
            const price = parseFloat(ad.price.replace(/[^0-9.]/g, ''));
            return price <= filters.maxPrice!;
        });
    }

    if (filters.location) {
        ads = ads.filter(ad =>
            ad.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
    }

    return ads;
};

/**
 * Trie les annonces
 */
export const sortAds = (ads: Ad[], sortBy: 'recent' | 'price-asc' | 'price-desc'): Ad[] => {
    const sorted = [...ads];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
                return priceA - priceB;
            });

        case 'price-desc':
            return sorted.sort((a, b) => {
                const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
                const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
                return priceB - priceA;
            });

        case 'recent':
        default:
            return sorted; // Par défaut, déjà trié par date récente
    }
};
