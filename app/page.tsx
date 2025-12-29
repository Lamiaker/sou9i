import { Suspense } from "react";
// Composants Async Wrappers (simulés pour la démo UX ou futurs fetchs)
import { SectionMomentDeVendreAsync } from "@/components/layout/SectionMomentDeVendreAsync";
import { SectionPubliciteAsync } from "@/components/layout/SectionPubliciteAsync";
import { SectionTendancesAsync } from "@/components/layout/SectionTendancesAsync";

// Skeletons
import SectionFeaturedSkeleton from "@/components/layout/SectionFeaturedSkeleton";
import SectionPubliciteSkeleton, { SectionMomentDeVendreSkeleton, SectionTendancesSkeleton } from "@/components/layout/HomeSkeletons";

// Nouveau: Composant dynamique pour les catégories
import DynamicCategorySections from "@/components/layout/DynamicCategorySections";

// ISR - Revalidation toutes les 60 secondes (au lieu de force-dynamic)
export const revalidate = 60;

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SweetLook - Achat et Vente entre femmes en Algérie',
  description: 'La première plateforme de vente et d\'achat dédiée aux femmes en Algérie. Mode, beauté, maison, enfants, et plus encore.',
  openGraph: {
    title: 'SweetLook - Achat et Vente entre femmes en Algérie',
    description: 'La première plateforme de vente et d\'achat dédiée aux femmes en Algérie.',
    type: 'website',
    siteName: 'SweetLook',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SweetLook - Achat et Vente entre femmes',
    description: 'La première plateforme dédiée aux femmes en Algérie.',
  },
};

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Publicité */}
      <Suspense fallback={<SectionPubliciteSkeleton />}>
        <SectionPubliciteAsync
          title="Zone de publicité"
          image="https://images.unsplash.com/photo-1517336714731-489689fd1ca8"
        />
      </Suspense>

      {/* Moment de vendre : Deposer une annonce */}
      <Suspense fallback={<SectionMomentDeVendreSkeleton />}>
        <SectionMomentDeVendreAsync
          title="C'est le moment de vendre"
          buttonText="Déposer une annonce"
        />
      </Suspense>

      {/* Tendances - Maintenant dynamique depuis l'admin */}
      <Suspense fallback={<SectionTendancesSkeleton />}>
        <SectionTendancesAsync title="Tendance en ce moment" />
      </Suspense>

      {/* Sections de catégories dynamiques avec streaming + Load More */}
      <Suspense fallback={
        <div className="space-y-8">
          <SectionFeaturedSkeleton />
          <SectionFeaturedSkeleton />
          <SectionFeaturedSkeleton />
          <SectionFeaturedSkeleton />
        </div>
      }>
        <DynamicCategorySections />
      </Suspense>
    </main>
  );
}

