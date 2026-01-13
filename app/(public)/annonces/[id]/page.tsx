import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdService } from "@/services";
import AdDetailClient from "@/components/ads/AdDetailClient";
import AdminAdActionsWrapper from "@/components/admin/AdminAdActionsWrapper";


// ISR - Revalidation toutes les 24 heures (les modifications déclenchent revalidatePath)
export const revalidate = 86400;
export const dynamicParams = true;


export async function generateStaticParams() {
    try {
        const popularAds = await AdService.getPopularAdIds(50);
        return popularAds.map((id) => ({ id }));
    } catch (error) {
        console.error('Error generating static params for ads:', error);
        return [];
    }
}

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sweetlook.net';

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
            title: `${ad.title} - ${formattedPrice} | SweetLook`,
            description: description || `Découvrez cette annonce sur SweetLook: ${ad.title} à ${formattedPrice}`,
            openGraph: {
                title: `${ad.title} - ${formattedPrice}`,
                description: description,
                type: 'website',
                siteName: 'SweetLook',
                images: ad.images && ad.images.length > 0 ? [
                    {
                        url: ad.images[0].startsWith('http') ? ad.images[0] : `${BASE_URL}${ad.images[0]}`,
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
                images: ad.images && ad.images.length > 0 ? [
                    ad.images[0].startsWith('http') ? ad.images[0] : `${BASE_URL}${ad.images[0]}`
                ] : undefined,
            },
            robots: {
                index: true,
                follow: true,
            },
            alternates: {
                canonical: `${BASE_URL}/annonces/${id}`,
            },
        };
    } catch {
        return {
            title: 'Annonce non trouvée | SweetLook',
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

/**
 * ✅ SÉCURITÉ: Sanitise les chaînes pour éviter les injections dans JSON-LD
 * Échappe les caractères potentiellement dangereux dans les balises script
 */
function sanitizeForJsonLd(value: unknown): unknown {
    if (typeof value === 'string') {
        return value
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027')
            .replace(/"/g, '\\u0022');
    }
    if (Array.isArray(value)) {
        return value.map(sanitizeForJsonLd);
    }
    if (value && typeof value === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(value)) {
            sanitized[key] = sanitizeForJsonLd(val);
        }
        return sanitized;
    }
    return value;
}

// Composant JSON-LD pour les données structurées
function JsonLd({ data }: { data: object }) {
    // ✅ SÉCURITÉ: Sanitiser les données avant de les injecter
    const sanitizedData = sanitizeForJsonLd(data);
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sanitizedData) }}
        />
    );
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

    // ✅ Vérifier les conditions d'accès
    // - L'annonce doit exister et être active/approuvée pour le rendu public
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

    // Données structurées Schema.org (Product + Offer)
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: ad.title,
        description: ad.description,
        image: ad.images && ad.images.length > 0
            ? ad.images.map((img: string) => img.startsWith('http') ? img : `${BASE_URL}${img}`)
            : undefined,
        offers: {
            '@type': 'Offer',
            price: ad.price,
            priceCurrency: 'DZD',
            availability: 'https://schema.org/InStock',
            url: `${BASE_URL}/annonces/${ad.id}`,
            seller: {
                '@type': 'Person',
                name: ad.user.name || 'Vendeur',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: ad.location,
                    addressCountry: 'DZ',
                },
            },
        },
        category: ad.category?.name,
        brand: {
            '@type': 'Brand',
            name: 'SweetLook',
        },
    };

    // Données structurées BreadcrumbList
    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Accueil',
                item: BASE_URL,
            },
            ...(ad.category ? [{
                '@type': 'ListItem',
                position: 2,
                name: ad.category.name,
                item: `${BASE_URL}/categories/${ad.category.slug}`,
            }] : []),
            {
                '@type': 'ListItem',
                position: ad.category ? 3 : 2,
                name: ad.title,
                item: `${BASE_URL}/annonces/${ad.id}`,
            },
        ],
    };

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
        showPhone: ad.showPhone,
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


    return (
        <>
            {/* Données structurées JSON-LD */}
            <JsonLd data={structuredData} />
            <JsonLd data={breadcrumbData} />

            {/* ✅ Panneau de Modération Admin (Géré côté client) */}
            <AdminAdActionsWrapper
                adId={ad.id}
                moderationStatus={ad.moderationStatus}
                rejectionReason={ad.rejectionReason}
            />

            {/* Composant client */}
            <AdDetailClient ad={formattedAd} similarAds={formattedSimilarAds} />
        </>
    );
}
