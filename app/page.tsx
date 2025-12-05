import { prisma } from "@/lib/prisma";
import { AdService } from "@/services";
import { SectionMomentDeVendre } from "@/components/layout/SectionMomentDeVendre";
import { SectionPublicite } from "@/components/layout/SectionPublicite";
import { SectionTendances } from "@/components/layout/SectionTendances";
import { tendances } from "@/lib/data/tendances";
import SectionFeatured from "@/components/layout/SectionFeatured";
import { ProductItem } from "@/types";

export const dynamic = 'force-dynamic';

// Fonction pour calculer le temps écoulé
function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " an(s)";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " mois";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " j";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return "À l'instant";
}

// Fonction pour récupérer les données d'une section
async function getSectionData(slug: string) {
  try {
    // 1. Trouver la catégorie par slug
    // On essaie de trouver une catégorie qui contient ce slug (plus souple)
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: slug },
          { slug: { contains: slug } }
        ]
      }
    });

    if (!category) return [];

    // 2. Récupérer les annonces via notre service (qui gère déjà les sous-catégories !)
    const { ads } = await AdService.getAds({
      categoryId: category.id,
      status: 'active'
    }, 1, 8); // Limite à 8 items

    // 3. Mapper vers ProductItem
    return ads.map(ad => ({
      id: ad.id,
      sellerName: ad.user?.name || "Vendeur",
      sellerRating: 5.0, // Valeur par défaut
      sellerReviews: 0,
      sellerAvatar: ad.user?.avatar || "/images/avatars/default-avatar.png",
      title: ad.title,
      price: ad.price.toLocaleString("fr-DZ") + " DA",
      photos: ad.images,
      location: ad.location,
      postedTime: getTimeAgo(new Date(ad.createdAt)),
      deliveryAvailable: ad.deliveryAvailable,
      deliveryMethods: [],
      description: ad.description,
      condition: ad.condition || undefined,
      brand: ad.brand || undefined,
      size: ad.size || undefined,
    })) as ProductItem[];
  } catch (error) {
    console.error(`Erreur chargement section ${slug}:`, error);
    return [];
  }
}

export default async function Home() {
  // Chargement parallèle des données pour la performance
  const [gateauxData, decorationData, modeData, enfantData] = await Promise.all([
    getSectionData('gateaux'),
    getSectionData('decoration'),
    getSectionData('mode'), // Cherche 'mode' ou 'mode-beaute'
    getSectionData('bebe'), // Cherche 'bebe' ou 'bebe-enfant'
  ]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Publicité */}
      <SectionPublicite
        title="Zone de publicité"
        image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
      />

      {/* Moment de vendre : Deposer une annonce */}
      <SectionMomentDeVendre
        title="C'est le moment de vendre"
        description=""
        buttonText="Déposer une annonce"
      />

      {/* Tendances (Reste statique pour l'instant comme demandé) */}
      <SectionTendances
        title="Tendance en ce moment"
        items={tendances}
      />

      {/* Featured Section - Cakes */}
      {gateauxData.length > 0 && (
        <SectionFeatured
          title="Gâteaux & Pâtisserie"
          viewAllLink="/categories/gateaux-sucre-sale"
          products={gateauxData}
        />
      )}

      {/* Featured Section - Decoration */}
      {decorationData.length > 0 && (
        <SectionFeatured
          title="Décoration & Événements"
          viewAllLink="/categories/decoration-evenements"
          products={decorationData}
        />
      )}

      {/* Featured Section - Beauty */}
      {modeData.length > 0 && (
        <SectionFeatured
          title="Mode & Beauté"
          viewAllLink="/categories/mode-beaute"
          products={modeData}
        />
      )}

      {/* Featured Section - Kids */}
      {enfantData.length > 0 && (
        <SectionFeatured
          title="Bébé & Enfants"
          viewAllLink="/categories/bebe-enfant"
          products={enfantData}
        />
      )}
    </main>
  );
}
