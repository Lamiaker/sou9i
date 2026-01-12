"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";

// Interface pour les props
interface ListeCategoricesProps {
  isMobileMenu?: boolean;
  onSelectItem?: (path: string) => void;
  showAll?: boolean;
}

export default function ListeCategorices({ isMobileMenu = false, onSelectItem, showAll = false }: ListeCategoricesProps) {
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const pathname = usePathname();

  const { categories, loading, error } = useCategories({
    type: 'hierarchy',
    withCount: true
  });

  const MAX_DESKTOP_CATEGORIES = 5
    ;

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

  // Détecter la catégorie active depuis l'URL
  const currentCategorySlug = useMemo(() => {
    if (!pathname) return null;
    const match = pathname.match(/\/categories\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  // Skeleton Loader élégant
  if (loading) {
    if (isMobileMenu) {
      return (
        <>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="py-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
            </div>
          ))}
        </>
      );
    }

    return (
      <div className="w-full bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100">
        <nav className="relative">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center justify-start gap-2 py-3 text-sm">
              {[...Array(6)].map((_, i) => (
                <li key={i} className="flex items-center">
                  <div className="px-4 py-2 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded-full w-20"></div>
                  </div>
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
            className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-primary/5 transition-all text-gray-700 font-medium text-sm group"
            onClick={() => onSelectItem && onSelectItem(cat.slug)}
          >
            <span className="group-hover:text-primary transition-colors">{cat.name}</span>
            {cat._count?.ads !== undefined && cat._count.ads > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all">
                {cat._count.ads}
              </span>
            )}
          </Link>
        ))}
      </>
    );
  }

  const activeCat = displayedCategories.find(cat => cat.id === hoverCategory);

  // Menu normal desktop
  return (
    <div className="w-full bg-white border-b border-gray-100 shadow-sm">
      <nav className="relative">
        <div className="max-w-7xl mx-auto px-4">
          <ul
            className="flex items-center justify-start gap-1 py-2 text-sm overflow-x-auto scrollbar-hide"
            onMouseLeave={() => setHoverCategory(null)}
          >
            {displayedCategories.map((cat) => {
              const hasChildren = cat.children && cat.children.length > 0;
              const isHovered = hoverCategory === cat.id;
              const isCurrentPage = currentCategorySlug === cat.slug;

              return (
                <li
                  key={cat.id}
                  className="flex items-center flex-shrink-0"
                  onMouseEnter={() => setHoverCategory(cat.id)}
                >
                  <Link
                    href={`/categories/${cat.slug}`}
                    className={`
                      px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap 
                      flex items-center gap-1.5
                      ${isCurrentPage
                        ? "bg-primary text-white font-semibold shadow-md"
                        : isHovered
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    {cat.name}
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isHovered ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>
                </li>
              );
            })}

            {hasMore && (
              <li className="flex items-center flex-shrink-0">
                <Link
                  href="/categories"
                  className="px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap border-2 border-primary/30 text-primary font-medium hover:bg-primary hover:text-white hover:border-primary flex items-center gap-1"
                >
                  Voir tout
                  <ChevronRight size={16} />
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Dropdown sous-catégories amélioré */}
        {hoverCategory !== null && activeCat && activeCat.children && activeCat.children.length > 0 && (
          <div
            className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50"
            onMouseEnter={() => setHoverCategory(hoverCategory)}
            onMouseLeave={() => setHoverCategory(null)}
            style={{
              animation: "fadeSlideDown 0.2s ease-out forwards",
            }}
          >
            {/* Header du dropdown */}
            <div className="max-w-7xl mx-auto px-4">
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{activeCat.name}</h3>
                    <p className="text-sm text-gray-500">
                      {activeCat.children.length} sous-catégorie{activeCat.children.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Link
                    href={`/categories/${activeCat.slug}`}
                    className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    Voir tout
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Grille des sous-catégories */}
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {activeCat.children.map((child, index) => (
                  <Link
                    key={child.id}
                    href={`/categories/${child.slug}`}
                    className="group p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover:shadow-md"
                    style={{
                      animation: `fadeSlideUp 0.2s ease-out forwards`,
                      animationDelay: `${index * 30}ms`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700 group-hover:text-primary transition-colors text-sm">
                        {child.name}
                      </h4>
                      <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    {child._count?.ads !== undefined && (
                      <p className="text-xs text-gray-400 mt-1 group-hover:text-primary/70 transition-colors">
                        {child._count.ads} annonce{child._count.ads > 1 ? 's' : ''}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* CSS pour les animations */}
      <style jsx>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}