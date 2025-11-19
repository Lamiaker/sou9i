"use client";

import { useState } from "react";
import categories from "@/app/Data/categories";

// Interface pour les props
interface ListeCategoricesProps {
  isMobileMenu?: boolean;
}

export default function ListeCategorices({ isMobileMenu = false }: ListeCategoricesProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

const generateCategoryLink = (name: string) => {
  return "/" + encodeURIComponent(name.toLowerCase());
};


  // Si c'est pour le menu mobile latéral, afficher une liste verticale simple
  if (isMobileMenu) {
    return (
      <>
        {categories.map((cat, index) => (
          <a
            href={generateCategoryLink(cat.name)}
            key={index}
            className="flex items-center text-left py-2 hover:bg-gray-50 transition text-gray-700 font-medium text-sm"
          >
            {cat.name}
          </a>
        ))}
      </>
    );
  }

  // Sinon, afficher le menu normal avec dropdowns (Desktop et Mobile horizontal)
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <ul
            className="flex items-center justify-start gap-1 py-4 text-sm"
            onMouseLeave={() => setActiveCategory(null)}
          >
            {categories.map((cat, index) => (
              <li
                key={index}
                className="flex items-center"
                onMouseEnter={() => setActiveCategory(index)}
              >
                <a
                  href={generateCategoryLink(cat.name)}

                  className={`px-3 py-1 transition-all duration-200 whitespace-nowrap relative ${
                    activeCategory === index
                      ? "text-gray-700 font-semibold"
                      : "text-gray-700 font-normal hover:text-primary"
                  }`}
                >
                  {cat.name}
                  {activeCategory === index && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary"></span>
                  )}
                </a>
                {index < categories.length - 1 && (
                  <span className="text-gray-300 select-none">·</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Dropdown sous-catégories - Desktop uniquement */}
        {activeCategory !== null &&
          categories[activeCategory].sousCategories.length > 0 && (
            <div
              className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-fadeIn"
              onMouseEnter={() => setActiveCategory(activeCategory)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap gap-8">
                  {categories[activeCategory].sousCategories.map(
                    (souscat, idx) => (
                      <div key={idx} className="animate-slideDown min-w-[200px]">
                        <h3 className="font-bold text-gray-700 mb-3 text-sm">
                          {souscat.titre}
                        </h3>
                        {souscat.items.length > 0 && (
                          <ul className="space-y-2">
                            {souscat.items.map((item, itemIdx) => (
                              <li key={itemIdx}>
                                <a
                                  href="#"
                                  className="text-sm text-gray-600 hover:text-secondary transition-colors duration-200 block py-1"
                                >
                                  {item}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                        {/* Afficher un indicateur si pas d'items mais titre présent */}
                        {souscat.items.length === 0 && (
                          <a
                            href="#"
                            className="text-sm text-gray-600 hover:text-secondary transition-colors duration-200 block py-1"
                          >
                            Voir tout
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
             
              </div>
            </div>
          )}
      </nav>
     
    </div>
  );
}