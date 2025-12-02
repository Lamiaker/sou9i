import Head from "next/head";
import Image from "next/image";
import { SectionMomentDeVendre } from "@/components/layout/SectionMomentDeVendre";
import { SectionPublicite } from "@/components/layout/SectionPublicite";
import { SectionTendances } from "@/components/layout/SectionTendances";
import { tendances } from "./Data/tendances";
import SectionFeatured from "@/components/layout/SectionFeatured";
import { vetementsProducts } from "@/app/Data/products-vetements";
import { categories } from "@/app/Data/categories";
import { gateauxProducts, decorationProducts, beauteProducts, enfantProducts } from "@/app/Data/featuredCategories";


export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-4">
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

      {/* Tendances */}
      {/* <SectionTendances
        title="Tendance en ce moment"
        items={categories.map(cat => ({
          title: cat.name,
          img: cat.image || "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop" // Fallback image
        }))}
      /> */}
      <SectionTendances
        title="Tendance en ce moment"
        items={tendances}
      />
      {/* Featured Section - Cakes */}
      <SectionFeatured
        title="Gâteaux & Pâtisserie"
        viewAllLink="/categories/gateaux"
        products={gateauxProducts}
      />

      {/* Featured Section - Decoration */}
      <SectionFeatured
        title="Décoration & Événements"
        viewAllLink="/categories/decoration"
        products={decorationProducts}
      />

      {/* Featured Section - Beauty */}
      <SectionFeatured
        title="Mode & Beauté"
        viewAllLink="/categories/mode"
        products={beauteProducts}
      />

      {/* Featured Section - Kids */}
      <SectionFeatured
        title="Bébé & Enfants"
        viewAllLink="/categories/bebes"
        products={enfantProducts}
      />
    </main>
  );
}
