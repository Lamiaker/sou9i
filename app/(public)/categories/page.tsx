import { Suspense } from "react";
import { Metadata } from "next";
import { CategoryService } from "@/services";
import CategoriesListClient from "@/components/categories/CategoriesListClient";

/**
 * Page des catégories avec ISR
 * 
 * Cette page est rendue statiquement avec les données initiales (page 1).
 * La pagination est gérée côté client via le composant CategoriesListClient.
 * 
 * ISR: Revalidation toutes les 24 heures (les modifications déclenchent revalidatePath)
 */
export const revalidate = 86400;

// Métadonnées SEO
export const metadata: Metadata = {
    title: 'Toutes les catégories | SweetLook',
    description: 'Explorez toutes les catégories disponibles sur SweetLook : mode, beauté, maison, enfants et bien plus. Trouvez ce que vous cherchez parmi nos nombreuses catégories.',
    openGraph: {
        title: 'Toutes les catégories | SweetLook',
        description: 'Explorez toutes les catégories disponibles sur SweetLook.',
        type: 'website',
        siteName: 'SweetLook',
        locale: 'fr_FR',
    },
    twitter: {
        card: 'summary',
        title: 'Catégories | SweetLook',
        description: 'Explorez toutes nos catégories de produits.',
    },
};

// Skeleton pour le chargement
function CategoriesSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="bg-white rounded-xl h-48 animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function CategoriesPage() {
    // Récupérer les catégories côté serveur avec pagination par défaut
    // Pas de searchParams pour permettre l'ISR
    const defaultPage = 1;
    const defaultLimit = 12;

    let categories: any[] = [];
    let pagination = { page: defaultPage, limit: defaultLimit, total: 0, totalPages: 1 };

    try {
        const result = await CategoryService.getCategoriesHierarchyPaginated({
            page: defaultPage,
            limit: defaultLimit,
        });
        categories = result.categories || [];
        pagination = result.pagination;
    } catch (error) {
        console.error('Error fetching categories:', error);
    }

    // Formatter les données pour le composant client
    const formattedCategories = categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        description: category.description,
        _count: {
            children: category._count?.children || 0,
            ads: category._count?.ads || 0,
        },
        children: category.children?.map((child: any) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
        })) || [],
    }));

    return (
        <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesListClient
                categories={formattedCategories}
                pagination={pagination}
            />
        </Suspense>
    );
}
