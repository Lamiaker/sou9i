"use client";
import { useRef } from "react";

interface ProductItem {
  id: string;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  sellerAvatar: string;
  title: string;
  price: string;
  image: string;
  deliveryAvailable: boolean;
  location: string;
  postedTime: string;
}

interface SectionVetementsProps {
  title?: string;
  viewAllLink?: string;
  products?: ProductItem[];
}

export default function SectionVetements({ 
  title = "Vêtements",
  viewAllLink = "#",
  products = [
    {
      id: "1",
      sellerName: "xuan",
      sellerRating: 4.9,
      sellerReviews: 20,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuan",
      title: "Pantalon cargo 3-4 ans",
      price: "5 €",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "Montreuil 93100",
      postedTime: "aujourd'hui à 13:47"
    },
    {
      id: "2",
      sellerName: "Stevanne",
      sellerRating: 4.9,
      sellerReviews: 57,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stevanne&backgroundColor=ff6b6b",
      title: "Vend pull femme",
      price: "2 €",
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "Laval 53000",
      postedTime: "aujourd'hui à 13:47"
    },
    {
      id: "3",
      sellerName: "chrystelle",
      sellerRating: 5,
      sellerReviews: 183,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chrystelle&backgroundColor=4ecdc4",
      title: "Belle robe bustier effet marbre couleur beige ...",
      price: "10 €",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "La Ferté-Alais 91590",
      postedTime: "aujourd'hui à 13:47"
    },
    {
      id: "4",
      sellerName: "Laportas",
      sellerRating: 5,
      sellerReviews: 90,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laportas&backgroundColor=95e1d3",
      title: "Pull / Sweat a col V Ralph Lauren rose logo ...",
      price: "14 €",
      image: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "Vouneuil-sur-Vienne 86210",
      postedTime: "aujourd'hui à 13:47"
    },
    {
      id: "5",
      sellerName: "A-H",
      sellerRating: 5,
      sellerReviews: 1,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ah&backgroundColor=ffd93d",
      title: "Lot 2 bas jogging neuf puma taille L",
      price: "20 €",
      image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "Asnières-sur-Seine 92600",
      postedTime: "aujourd'hui à 13:47"
    },
    {
      id: "6",
      sellerName: "Marie",
      sellerRating: 4.8,
      sellerReviews: 45,
      sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie&backgroundColor=c7b3ff",
      title: "Veste en jean vintage",
      price: "15 €",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
      deliveryAvailable: true,
      location: "Paris 75011",
      postedTime: "aujourd'hui à 14:20"
    }
  ]
}: SectionVetementsProps) {
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
    <section className="w-full mb-12 bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
          <a 
            href={viewAllLink}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition"
          >
            Voir plus d'annonces
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* En ce moment sur leboncoin */}
        <p className="text-sm text-gray-600 mb-6">En ce moment sur leboncoin</p>

        {/* SLIDER */}
        <div className="relative">
          {/* Boutons Prev / Next */}
          <button
            onClick={scrollLeft}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition border border-gray-200"
            aria-label="Précédent"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white rounded-full shadow-lg hover:bg-gray-50 transition border border-gray-200"
            aria-label="Suivant"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Conteneur products */}
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="relative min-w-[280px] bg-white rounded-lg overflow-hidden cursor-pointer group snap-start shrink-0 hover:shadow-lg transition-shadow"
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
                    <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
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
                    src={product.image}
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
                  <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}