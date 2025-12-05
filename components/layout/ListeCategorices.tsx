"use client";

import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Interface pour les props
interface ListeCategoricesProps {
  isMobileMenu?: boolean;
  onSelectItem?: (path: string) => void;
  showAll?: boolean;
}

export default function ListeCategorices({ isMobileMenu = false, onSelectItem, showAll = false }: ListeCategoricesProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { categories, loading, error } = useCategories({
    type: 'hierarchy',
    withCount: true
  });

  const MAX_DESKTOP_CATEGORIES = 7;

  // Réorganiser les catégories : mettre "Autres" en dernier
  const sortedCategories = useMemo(() => {
    if (!categories.length) return [];

    const autresCategory = categories.find(cat =>
      cat.slug === 'autres' || cat.name.toLowerCase() === 'autres'
    );
    const otherCategories = categories.filter(cat =>
      cat.slug !== 'autres' && cat.name.toLowerCase() !== 'autres'
    );

    return autresCategory
      ? [...otherCategories, autresCategory]
      : categories;
  }, [categories]);

  const displayedCategories = useMemo(() => {
    if (showAll || isMobileMenu) {
      return sortedCategories;
    }
    return sortedCategories.slice(0, MAX_DESKTOP_CATEGORIES);
  }, [sortedCategories, showAll, isMobileMenu]);

  const hasMore = !showAll && !isMobileMenu && sortedCategories.length > MAX_DESKTOP_CATEGORIES;

  // Skeleton Loader élégant
  if (loading) {
    if (isMobileMenu) {
      return (
        <>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="py-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </>
      );
    }

    return (
      <div className="w-full bg-white border-b border-gray-200">
        <nav className="relative">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center justify-start gap-1 py-4 text-sm">
              {[...Array(6)].map((_, i) => (
                <li key={i} className="flex items-center">
                  <div className="px-3 py-1 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  {i < 5 && <span className="text-gray-300 select-none">·</span>}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    );
  }

  // Erreur silencieuse
  if (error) {
    console.error('Categories loading error:', error);
    return null;
  }

  // Menu mobile
  if (isMobileMenu) {
    return (
      <>
        {displayedCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="flex items-center text-left py-2 hover:bg-gray-50 transition text-gray-700 font-medium text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </>
    );
  }

  const activeCat = displayedCategories.find(cat => cat.id === activeCategory);

  // Menu normal
  return (
    <div className="w-full bg-white border-b border-gray-200">
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <ul
            className="flex items-center justify-start gap-1 py-4 text-sm overflow-x-auto scrollbar-hide"
            onMouseLeave={() => setActiveCategory(null)}
          >
            {displayedCategories.map((cat, index) => (
              <li
                key={cat.id}
                className="flex items-center flex-shrink-0"
                onMouseEnter={() => setActiveCategory(cat.id)}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className={`px-3 py-1 transition-all duration-200 whitespace-nowrap relative ${activeCategory === cat.id
                    ? "text-gray-700 font-semibold"
                    : "text-gray-700 font-normal hover:text-primary"
                    }`}
                >
                  {cat.name}
                  {activeCategory === cat.id && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary"></span>
                  )}
                </Link>
                {index < displayedCategories.length - 1 && (
                  <span className="text-gray-300 select-none">·</span>
                )}
              </li>
            ))}

            {hasMore && (
              <>
                <span className="text-gray-300 select-none flex-shrink-0">·</span>
                <li className="flex items-center flex-shrink-0">
                  <Link
                    href="/categories"
                    className="px-3 py-1 transition-all duration-200 whitespace-nowrap text-primary font-semibold hover:text-secondary flex items-center gap-1"
                  >
                    Plus
                    <ChevronRight size={16} />
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Dropdown sous-catégories */}
        {activeCategory !== null && activeCat && activeCat.children && activeCat.children.length > 0 && (
          <div
            className="absolute left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-fadeIn"
            onMouseEnter={() => setActiveCategory(activeCategory)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {activeCat.children.map((child) => (
                  <div key={child.id} className="animate-slideDown">
                    <Link
                      href={`/categories/${child.slug}`}
                      className="group"
                    >
                      <h3 className="font-semibold text-gray-700 mb-2 text-sm group-hover:text-primary transition-colors">
                        {child.name}
                      </h3>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}