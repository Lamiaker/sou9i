import Head from "next/head";
import Image from "next/image";
import { SectionMomentDeVendre } from "@/components/layout/SectionMomentDeVendre";
import { SectionPublicite } from "@/components/layout/SectionPublicite";
import { SectionTendances } from "@/components/layout/SectionTendances";
import { tendances } from "./Data/tendances"; 
import SectionVetements from "@/components/layout/SectionVetements";
import { vetementsProducts } from "@/app/Data/products-vetements";
import SectionImmobilier from "@/components/layout/SectionImmobilier";
import immobilierExamples from "./Data/immobilierExamples";


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
        <SectionTendances
          title="Tendance en ce moment"
          items={tendances}
        />

        {/* Vêtements */}
        <SectionVetements
          title="Vêtements"
          viewAllLink="#"
          products={vetementsProducts}
         
        />
        <SectionImmobilier
          title="Immobilier"
          viewAllLink="#"
          biens={immobilierExamples}
        />

</main>
);
}
