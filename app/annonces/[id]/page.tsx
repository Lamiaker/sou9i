import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdService } from "@/services";
import AdDetailClient from "@/components/ads/AdDetailClient";

// ISR - Revalidation toutes les 60 secondes
export const revalidate = 60;

// Générer les métadonnées dynamiques pour le SEO et Open Graph
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    try {
        const { id } = await params;
        const ad = await AdService.getAdById(id);

        // Formater le prix pour les métadonnées
        const formattedPrice = new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
        }).format(ad.price);

        const description = ad.description.length > 160
            ? ad.description.substring(0, 157) + '...'
            : ad.description;

        return {
            title: `${ad.title} - ${formattedPrice} | SweetLook `,
            description: description || `Découvrez cette annonce sur SweetLook: ${ad.title} à ${formattedPrice}`,
            openGraph: {
                title: `${ad.title} - ${formattedPrice}`,
                description: description,
                type: 'website',
                siteName: 'FemMarket',
                images: ad.images && ad.images.length > 0 ? [
                    {
                        url: ad.images[0],
                        width: 800,
                        height: 600,
                        alt: ad.title,
                    }
                ] : undefined,
                locale: 'fr_FR',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${ad.title} - ${formattedPrice}`,
                description: description,
                images: ad.images && ad.images.length > 0 ? [ad.images[0]] : undefined,
            },
            robots: {
                index: true,
                follow: true,
            },
            alternates: {
                canonical: `/annonces/${id}`,
            },
        };
    } catch {
        return {
            title: 'Annonce non trouvée | FemMarket',
            description: 'Cette annonce n\'existe pas ou a été supprimée.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdDetailPage({ params }: PageProps) {
    const { id } = await params;

    // Récupérer l'annonce depuis la base de données
    let ad;
    try {
        ad = await AdService.getAdById(id);

        // Incrémenter les vues (fire and forget - ne pas bloquer le rendu)
        AdService.incrementViews(id).catch(() => { });
    } catch {
        notFound();
    }

    // Vérifier que l'annonce est active et approuvée
    if (!ad || ad.status !== 'active' || ad.moderationStatus !== 'APPROVED') {
        notFound();
    }

    // Récupérer les annonces similaires (même catégorie)
    let similarAds: any[] = [];
    try {
        const result = await AdService.getAds(
            {
                categoryId: ad.categoryId,
                status: 'active',
                moderationStatus: 'APPROVED',
            },
            1, // page
            5  // limit (on prend 5 pour exclure l'annonce courante et avoir 4)
        );
        similarAds = result.ads || [];
    } catch (error) {
        console.error('Error fetching similar ads:', error);
    }

    // Formatter les données pour le composant client
    const formattedAd = {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        location: ad.location,
        images: ad.images || [],
        views: ad.views,
        createdAt: ad.createdAt instanceof Date ? ad.createdAt.toISOString() : String(ad.createdAt),
        contactPhone: ad.contactPhone,
        user: {
            id: ad.user.id,
            name: ad.user.name,
            avatar: ad.user.avatar,
            city: ad.user.city,
            phone: ad.user.phone,
            isVerified: ad.user.isVerified,
            createdAt: ad.user.createdAt instanceof Date ? ad.user.createdAt.toISOString() : String(ad.user.createdAt),
        },
        category: ad.category ? {
            id: ad.category.id,
            name: ad.category.name,
            slug: ad.category.slug,
        } : null,
        dynamicFields: ad.dynamicFields?.map((df: any) => ({
            id: df.id,
            value: df.value,
            field: {
                id: df.field.id,
                name: df.field.name,
                label: df.field.label || df.field.name,
                type: df.field.type,
            },
        })) || [],
    };

    const formattedSimilarAds = similarAds
        .filter(similarAd => similarAd.id !== id) // Exclure l'annonce courante
        .slice(0, 4) // Limiter à 4
        .map((similarAd: any) => ({
            id: similarAd.id,
            title: similarAd.title,
            price: similarAd.price,
            location: similarAd.location,
            images: similarAd.images || [],
        }));

    return <AdDetailClient ad={formattedAd} similarAds={formattedSimilarAds} />;
}
