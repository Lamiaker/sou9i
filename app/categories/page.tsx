import { Metadata } from "next";
import { CategoryService } from "@/services";
import CategoriesListClient from "@/components/categories/CategoriesListClient";

// ISR - Revalidation toutes les 120 secondes
export const revalidate = 120;

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

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
    }>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '12');

    // Récupérer les catégories côté serveur avec pagination
    let categories: any[] = [];
    let pagination = { page: 1, limit: 12, total: 0, totalPages: 1 };

    try {
        const result = await CategoryService.getCategoriesHierarchyPaginated({
            page,
            limit,
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
        <CategoriesListClient
            categories={formattedCategories}
            pagination={pagination}
        />
    );
}
