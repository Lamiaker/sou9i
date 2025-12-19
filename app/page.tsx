import { Suspense } from "react";
// Composants Async Wrappers (simulés pour la démo UX ou futurs fetchs)
import { SectionMomentDeVendreAsync } from "@/components/layout/SectionMomentDeVendreAsync";
import { SectionPubliciteAsync } from "@/components/layout/SectionPubliciteAsync";
import { SectionTendancesAsync } from "@/components/layout/SectionTendancesAsync";
import { tendances } from "@/lib/data/tendances";

// Skeletons
import SectionFeaturedAsync from "@/components/layout/SectionFeaturedAsync";
import SectionFeaturedSkeleton from "@/components/layout/SectionFeaturedSkeleton";
import SectionPubliciteSkeleton, { SectionMomentDeVendreSkeleton, SectionTendancesSkeleton } from "@/components/layout/HomeSkeletons";

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FemMarket - Achat et Vente entre femmes en Algérie',
  description: 'La première plateforme de vente et d\'achat dédiée aux femmes en Algérie. Mode, beauté, maison, enfants, et plus encore.',
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
          title="c&apos;est le moment de vendre"
          buttonText="Déposer une annonce"
        />
      </Suspense>

      {/* Tendances */}
      <Suspense fallback={<SectionTendancesSkeleton />}>
        <SectionTendancesAsync
          title="Tendance en ce moment"
          items={tendances}
        />
      </Suspense>

      {/* Featured Section - Cakes */}
      <Suspense fallback={<SectionFeaturedSkeleton />}>
        <SectionFeaturedAsync
          slug="gateaux"
          title="Gâteaux & Pâtisserie"
          viewAllLink="/categories/gateaux-patisserie"
        />
      </Suspense>

      {/* Featured Section - Decoration */}
      <Suspense fallback={<SectionFeaturedSkeleton />}>
        <SectionFeaturedAsync
          slug="decoration"
          title="Décoration & Événements"
          viewAllLink="/categories/decoration-evenements"
        />
      </Suspense>

      {/* Featured Section - Beauty */}
      <Suspense fallback={<SectionFeaturedSkeleton />}>
        <SectionFeaturedAsync
          slug="mode"
          title="Mode & Beauté"
          viewAllLink="/categories/mode-beaute"
        />
      </Suspense>

      {/* Featured Section - Kids */}
      <Suspense fallback={<SectionFeaturedSkeleton />}>
        <SectionFeaturedAsync
          slug="bebe"
          title="Bébé & Enfants"
          viewAllLink="/categories/bebe-enfants"
        />
      </Suspense>
    </main>
  );
}

