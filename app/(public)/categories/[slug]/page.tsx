import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryService, AdService } from "@/services";
import CategoryAdsClient from "@/components/categories/CategoryAdsClient";

/**
 * Page catégorie avec ISR
 * 
 * Cette page est pré-générée au build pour toutes les catégories existantes.
 * ISR: Revalidation toutes les 12 heures ou via revalidatePath.
 * 
 * Les catégories sont disponibles dans la DB avant le build.
 * Les nouvelles catégories créées via admin seront générées à la demande
 * grâce à dynamicParams = true.
 */
export const revalidate = 43200;
export const dynamicParams = true;

/**
 * Pré-génère les pages pour toutes les catégories existantes au build
 * Cela améliore le TTFB pour la première visite
 */
export async function generateStaticParams() {
    try {
        const categories = await CategoryService.getAllCategorySlugs();
        return categories.map((slug) => ({ slug }));
    } catch (error) {
        console.error('Error generating static params for categories:', error);
        return []; // Fallback: pages générées à la demande
    }
}

// Générer les métadonnées dynamiques pour le SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const { slug } = await params;
        const category = await CategoryService.getCategoryBySlug(slug);

        return {
            title: `${category.name} | SweetLook`,
            description: category.description || `Découvrez les meilleures annonces de ${category.name} sur SweetLook. Achetez et vendez en toute confiance.`,
            openGraph: {
                title: `${category.name} | SweetLook`,
                description: category.description || `Annonces ${category.name} sur SweetLook`,
                type: 'website',
            },
        };
    } catch {
        return {
            title: 'Catégorie non trouvée | SweetLook',
        };
    }
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Skeleton pour le chargement
function CategorySkeleton() {
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl h-[350px] animate-pulse">
                            <div className="h-[200px] bg-gray-200 rounded-t-xl"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;

    // Pagination par défaut pour permettre l'ISR
    const defaultPage = 1;
    const defaultLimit = 12;

    // Récupérer la catégorie depuis la base de données
    let category;
    try {
        category = await CategoryService.getCategoryBySlug(slug);
    } catch {
        notFound();
    }

    if (!category) {
        notFound();
    }

    // Récupérer les annonces de la catégorie avec pagination par défaut
    let ads: any[] = [];
    let pagination = { page: defaultPage, limit: defaultLimit, total: 0, totalPages: 1 };

    try {
        const result = await AdService.getAds(
            {
                categoryId: category.id,
                status: 'active',
                moderationStatus: 'APPROVED',
            },
            defaultPage,
            defaultLimit
        );
        ads = result.ads || [];
        pagination = result.pagination;
    } catch (error) {
        console.error('Error fetching ads:', error);
    }

    // Formatter les données pour le client
    // Cast as any car le type Prisma de base ne connait pas les relations incluses
    const cat = category as any;
    const formattedCategory = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        parent: cat.parent ? {
            id: cat.parent.id,
            name: cat.parent.name,
            slug: cat.parent.slug,
        } : null,
        children: cat.children?.map((child: any) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
        })) || [],
    };

    const formattedAds = ads.map((ad: any) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        location: ad.location,
        images: ad.images || [],
        categoryId: ad.categoryId,
        status: ad.status,
        createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : ad.createdAt,
    }));

    return (
        <Suspense fallback={<CategorySkeleton />}>
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb - Rendu côté serveur pour SEO */}
                    <div className="mb-8">
                        <nav aria-label="Breadcrumb">
                            <ol className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                <li>
                                    <Link href="/" className="hover:text-primary transition">Accueil</Link>
                                </li>
                                <li><span>/</span></li>
                                <li>
                                    <Link href="/categories" className="hover:text-primary transition">Catégories</Link>
                                </li>
                                <li><span>/</span></li>
                                {cat.parent && (
                                    <>
                                        <li>
                                            <Link href={`/categories/${cat.parent.slug}`} className="hover:text-primary transition">
                                                {cat.parent.name}
                                            </Link>
                                        </li>
                                        <li><span>/</span></li>
                                    </>
                                )}
                                <li>
                                    <span className="text-gray-900 font-medium">{cat.name}</span>
                                </li>
                            </ol>
                        </nav>

                        <h1 className="text-3xl font-bold text-gray-900">{cat.name}</h1>
                        {cat.description && (
                            <p className="text-gray-500 mt-2">{cat.description}</p>
                        )}
                    </div>

                    {/* Composant client pour les filtres et l'affichage interactif */}
                    <CategoryAdsClient
                        category={formattedCategory}
                        initialAds={formattedAds}
                        pagination={pagination}
                    />
                </div>
            </div>
        </Suspense>
    );
}
