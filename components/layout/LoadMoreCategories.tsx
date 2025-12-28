"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import SectionFeatured from "./SectionFeatured";
import SectionFeaturedSkeleton from "./SectionFeaturedSkeleton";
import { ProductItem } from "@/types";

interface CategoryWithAds {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    totalAds: number;
}

interface CategoryWithProducts extends CategoryWithAds {
    products: ProductItem[];
    isLoading?: boolean;
}

interface LoadMoreCategoriesProps {
    initialSkip: number;
    totalRemaining: number;
}

export default function LoadMoreCategories({
    initialSkip,
    totalRemaining: initialRemaining
}: LoadMoreCategoriesProps) {
    const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
    const [skip, setSkip] = useState(initialSkip);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalRemaining, setTotalRemaining] = useState(initialRemaining);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            // 1. Charger les catégories
            const response = await fetch(`/api/categories/with-ads?skip=${skip}&take=4`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.error);

            // 2. Pour chaque catégorie, charger les produits
            const categoriesWithProducts: CategoryWithProducts[] = await Promise.all(
                data.categories.map(async (category: CategoryWithAds) => {
                    try {
                        // Fetch products for this category
                        const productsResponse = await fetch(`/api/section-data?slug=${category.slug}`);
                        const productsData = await productsResponse.json();

                        return {
                            ...category,
                            products: productsData.products || [],
                            isLoading: false,
                        };
                    } catch {
                        return {
                            ...category,
                            products: [],
                            isLoading: false,
                        };
                    }
                })
            );

            // Filtrer les catégories qui ont des produits
            const validCategories = categoriesWithProducts.filter(cat => cat.products.length > 0);

            setCategories(prev => [...prev, ...validCategories]);
            setSkip(prev => prev + 4);
            setHasMore(data.hasMore);
            setTotalRemaining(data.totalRemaining);
        } catch (error) {
            console.error("Erreur chargement catégories:", error);
        } finally {
            setIsLoading(false);
        }
    }, [skip, isLoading, hasMore]);

    return (
        <div className="space-y-8">
            {/* Catégories chargées dynamiquement */}
            {categories.map((category) => (
                category.isLoading ? (
                    <SectionFeaturedSkeleton key={category.id} />
                ) : (
                    <SectionFeatured
                        key={category.id}
                        title={category.name}
                        viewAllLink={`/categories/${category.slug}`}
                        products={category.products}
                    />
                )
            ))}

            {/* Skeletons pendant le chargement */}
            {isLoading && (
                <div className="space-y-8">
                    <SectionFeaturedSkeleton />
                    <SectionFeaturedSkeleton />
                </div>
            )}

            {/* Bouton "Voir plus" */}
            {hasMore && !isLoading && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMore}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <span>Afficher plus de catégories</span>
                        <span className="text-sm opacity-80">({totalRemaining})</span>
                        <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            )}

            {/* Message si toutes les catégories sont chargées */}
            {!hasMore && categories.length > 0 && (
                <div className="flex justify-center pt-4">
                    <p className="text-gray-500 text-sm">
                        ✨ Toutes les catégories ont été chargées
                    </p>
                </div>
            )}
        </div>
    );
}
