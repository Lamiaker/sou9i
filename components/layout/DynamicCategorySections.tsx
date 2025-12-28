import { Suspense } from "react";
import { CategoryService } from "@/services/categoryService";
import SectionFeaturedAsync from "./SectionFeaturedAsync";
import SectionFeaturedSkeleton from "./SectionFeaturedSkeleton";
import LoadMoreCategories from "./LoadMoreCategories";

interface CategoryWithAds {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    totalAds: number;
}

/**
 * Server Component qui récupère et affiche les catégories dynamiquement
 * - Affiche les 4 premières catégories avec streaming
 * - Affiche un bouton "Voir plus" s'il y a plus de catégories
 */
export default async function DynamicCategorySections() {
    // Récupérer les 4 premières catégories non vides
    const { categories, hasMore, totalRemaining } = await CategoryService.getCategoriesWithAds({
        skip: 0,
        take: 4,
    });

    if (categories.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Aucune catégorie avec des annonces pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Affichage des catégories initiales avec streaming */}
            {categories.map((category: CategoryWithAds) => (
                <Suspense key={category.id} fallback={<SectionFeaturedSkeleton />}>
                    <SectionFeaturedAsync
                        slug={category.slug}
                        title={category.name}
                        viewAllLink={`/categories/${category.slug}`}
                    />
                </Suspense>
            ))}

            {/* Bouton "Voir plus" si des catégories supplémentaires existent */}
            {hasMore && (
                <LoadMoreCategories
                    initialSkip={4}
                    totalRemaining={totalRemaining}
                />
            )}
        </div>
    );
}
