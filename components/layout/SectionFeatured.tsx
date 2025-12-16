"use client";
import { useRef } from "react";
import ArrowButton from "@/components/ui/ArrowButton";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { ProductItem } from "@/types";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";

export interface SectionFeaturedProps {
  title?: string;
  viewAllLink?: string;
  products?: ProductItem[];
}

export default function SectionFeatured({
  title,
  viewAllLink,
  products,
}: SectionFeaturedProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full mb-12 relative px-4 sm:px-0">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="max-w-7xl mx-auto relative group/slider">
        {/* Boutons Prev / Next */}
        <div className="hidden sm:block opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
          <ArrowButton
            direction="left"
            onClick={scrollLeft}
            className="-left-5 z-10 w-10 h-10 border border-gray-100 shadow-lg"
            ariaLabel="Précédent"
          />
          <ArrowButton
            direction="right"
            onClick={scrollRight}
            className="-right-5 z-10 w-10 h-10 border border-gray-100 shadow-lg"
            ariaLabel="Suivant"
          />
        </div>

        {/* SLIDER */}
        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products?.map((product) => (
            <Link
              key={product.id}
              href={`/annonces/${product.id}`}
              className="
                relative 
                min-w-[260px] w-[260px] 
                sm:min-w-[280px] sm:w-[280px] 
                bg-white rounded-2xl overflow-hidden 
                cursor-pointer group snap-start shrink-0 
                border border-gray-100 
                shadow-[0_2px_8px_rgba(0,0,0,0.04)] 
                hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] 
                hover:-translate-y-1
                transition-all duration-300
              "
            >
              {/* Image */}
              <div className="relative h-60 bg-gray-100 overflow-hidden">
                <img
                  src={product.photos[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Favorite button */}
                <div className="absolute top-3 right-3 shadow-sm rounded-full">
                  <FavoriteButton adId={product.id} size={18} />
                </div>

                {product.deliveryAvailable && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-green-700 shadow-sm">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    LIVRAISON
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="p-4 space-y-3">
                {/* Seller */}
                <div className="flex items-center gap-2">
                  <img src={product.sellerAvatar} alt={product.sellerName} className="w-6 h-6 rounded-full object-cover border border-gray-100" />
                  <span className="text-xs font-medium text-gray-500 truncate">{product.sellerName}</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 font-mono">
                    {product.price}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span className="truncate max-w-[100px]">{product.location}</span>
                  </div>
                  <span>{product.postedTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}