import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CategoryService, AdService } from "@/services";
import CategoryAdsClient from "@/components/categories/CategoryAdsClient";

// ISR - Revalidation toutes les 60 secondes (ou via revalidatePath)
export const revalidate = 60;

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

// Générer les routes statiques pour les catégories principales (optionnel)
export async function generateStaticParams() {
    try {
        const categories = await CategoryService.getAllCategories();

        // Générer les params pour toutes les catégories (parents + enfants)
        const allSlugs: { slug: string }[] = [];

        categories.forEach((cat: any) => {
            allSlugs.push({ slug: cat.slug });
            if (cat.children) {
                cat.children.forEach((child: any) => {
                    allSlugs.push({ slug: child.slug });
                });
            }
        });

        return allSlugs;
    } catch {
        return [];
    }
}

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{
        page?: string;
        limit?: string;
    }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
    const { slug } = await params;
    const queryParams = await searchParams;
    const page = parseInt(queryParams.page || '1');
    const limit = parseInt(queryParams.limit || '12');

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

    // Récupérer les annonces de la catégorie avec pagination
    let ads: any[] = [];
    let pagination = { page: 1, limit: 12, total: 0, totalPages: 1 };

    try {
        const result = await AdService.getAds(
            {
                categoryId: category.id,
                status: 'active',
                moderationStatus: 'APPROVED',
            },
            page,
            limit
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
    );
}
