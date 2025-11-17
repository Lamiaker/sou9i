"use client"; // nécessaire pour utiliser useRef et les événements

import Image from "next/image";
import { useRef } from "react";
import ArrowButton from "../ui/ArrowButton";
import {SectionTendancesProps} from "@/app/Data/types";

export function SectionTendances({ title, items }: SectionTendancesProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full mb-8 relative">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      {/* SLIDER */}
      <div className="relative ">
        {/* Boutons Prev / Next (desktop seulement) */}
               <ArrowButton
                      direction="left"
                      onClick={scrollLeft}
                      className="-left-4"
                      ariaLabel="Précédent"
                    />
        
                    <ArrowButton
                      direction="right"
                      onClick={scrollRight}
                      className="-right-4"
                      ariaLabel="Suivant"
                    />

        {/* Conteneur items */}
        <div
          ref={sliderRef}
          className="
            flex gap-4 overflow-x-auto pb-4 
            snap-x snap-mandatory 
            scrollbar-hide
            scroll-smooth
          "
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="
                relative min-w-[200px] h-64
                rounded-xl overflow-hidden cursor-pointer group
                snap-start shrink-0 
              "
            >
              <Image
                src={item.img}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <h3 className="absolute bottom-4 left-4 text-white font-medium text-base">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
