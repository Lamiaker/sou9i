"use client";

import { useRef } from "react";
import ArrowButton from "@/components/ui/ArrowButton";
import Link from "next/link";
import { ImmobilierItem } from "@/app/Data/immobilier";

interface SectionImmobilierProps {
  title: string;
  viewAllLink: string;
  biens: ImmobilierItem[];
}

export default function SectionImmobilier({ title, viewAllLink, biens }: SectionImmobilierProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full mb-12 py-8 px-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <Link href={viewAllLink} className="flex items-center gap-2 text-sm font-bold text-gray-700">
          Voir plus d'annonces
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto bg-gray-50 rounded-2xl px-4 py-5">
        {/* SLIDER */}
        <div className="relative">
          {/* Boutons Prev / Next */}
          <ArrowButton direction="left" onClick={scrollLeft} className="-left-4" ariaLabel="Précédent" />
          <ArrowButton direction="right" onClick={scrollRight} className="-right-4" ariaLabel="Suivant" />

          {/* Conteneur biens */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {biens.map((bien) => (
              <Link
                key={bien.id}
                href={`/immobilier/${bien.id}`}
                className="relative w-[280px] min-w-[280px] max-w-[280px] bg-white rounded-lg overflow-hidden cursor-pointer group snap-start shrink-0 hover:shadow-lg transition-shadow"
              >
                {/* Image principale */}
                <div className="relative h-72 bg-gray-100">
                  <img
                    src={bien.images[0]}
                    alt={`${bien.typeBien} à ${bien.localisation.ville}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Infos du bien */}
                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2 min-h-12">
                    {bien.typeBien} • {bien.typeTransaction}
                  </h3>

                  <p className="text-sm text-gray-500 mb-1">
                    {bien.localisation.ville} • {bien.localisation.codePostal}
                  </p>

                  <p className="text-sm text-gray-500 mb-2">
                    {bien.surface} m² • {bien.pieces} pièces
                  </p>

                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {bien.prix.toLocaleString("fr-FR")} DA
                  </p>

                  {bien.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">{bien.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
