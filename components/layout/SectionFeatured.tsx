"use client";
import { useRef } from "react";
import ArrowButton from "@/components/ui/ArrowButton";
import { ProductItem } from "@/types";
import Link from "next/link";

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
        left: -400,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full mb-12 py-8 px-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <a
          href={viewAllLink}
          className="flex items-center gap-2 text-sm font-bold text-gray-700 "
        >
          Voir plus d'annonces
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </a>

      </div>
      <div className="max-w-7xl mx-auto bg-gray-50 rounded-2xl px-4 py-5 ">
        {/* SLIDER */}
        <div className="relative ">
          {/* Boutons Prev / Next */}
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
          {/* Conteneur products */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth "
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products?.map((product) => (
              <Link
                key={product.id}
                href={`/annonces/${product.id}`}
                className="relative w-[60vw] min-w-[60vw] sm:w-[280px] sm:min-w-[280px] sm:max-w-[280px] bg-white rounded-lg overflow-hidden cursor-pointer group snap-start shrink-0 hover:shadow-lg transition-shadow"
              >
                {/* Seller info */}
                <div className="flex items-center gap-2 p-3 border-b border-gray-100">
                  <img
                    src={product.sellerAvatar}
                    alt={product.sellerName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.sellerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {product.sellerRating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.sellerReviews})
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-72 bg-gray-100">
                  <img
                    src={product.photos[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Favorite button */}
                  <button
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-50 transition"
                    aria-label="Ajouter aux favoris"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>

                {/* Product info */}
                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 min-h-12">
                    {product.title}
                  </h3>

                  <p className="text-xl font-bold text-gray-900 mb-3">
                    {product.price}
                  </p>

                  {product.deliveryAvailable && (
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded w-fit mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Livraison possible
                    </div>
                  )}

                  <div className="text-xs text-gray-600">
                    <p className="mb-1">{product.location}</p>
                    <p>• {product.postedTime}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}