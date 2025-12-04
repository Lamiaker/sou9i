"use client";

import { useCategories } from "@/hooks/useCategories";
import Link from "next/link";
import { ChevronRight, Grid3x3, List } from "lucide-react";
import { useState } from "react";

export default function CategoriesPage() {
    const { categories, loading, error } = useCategories({
        type: 'hierarchy',
        withCount: true
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-semibold">Erreur lors du chargement des catégories</p>
                    <p className="text-gray-500 mt-2">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Toutes les catégories</h1>
                            <p className="mt-2 text-gray-600">
                                Explorez nos {categories.length} catégories disponibles
                            </p>
                        </div>

                        {/* Toggle view mode */}
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition ${viewMode === 'grid'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                aria-label="Vue grille"
                            >
                                <Grid3x3 size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded transition ${viewMode === 'list'
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                aria-label="Vue liste"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid/List */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {viewMode === 'grid' ? (
                    /* Vue Grille */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 overflow-hidden group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition">
                                            {category.name}
                                        </h3>
                                        <ChevronRight className="text-gray-400 group-hover:text-primary transition flex-shrink-0 mt-1" size={20} />
                                    </div>

                                    {category._count && (
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>
                                                {category._count.ads > 0
                                                    ? `${category._count.ads} annonce${category._count.ads > 1 ? 's' : ''}`
                                                    : 'Aucune annonce'}
                                            </span>
                                            {category._count.children > 0 && (
                                                <span>
                                                    {category._count.children} sous-catégorie{category._count.children > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Sous-catégories */}
                                    {category.children && category.children.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <ul className="space-y-2">
                                                {category.children.slice(0, 3).map((child) => (
                                                    <li key={child.id} className="flex items-center text-sm text-gray-600">
                                                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                                                        {child.name}
                                                        {child._count && child._count.ads > 0 && (
                                                            <span className="ml-auto text-xs text-gray-400">
                                                                ({child._count.ads})
                                                            </span>
                                                        )}
                                                    </li>
                                                ))}
                                                {category.children.length > 3 && (
                                                    <li className="text-xs text-primary font-medium">
                                                        +{category.children.length - 3} autres
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Vue Liste */
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                            >
                                <Link
                                    href={`/categories/${category.slug}`}
                                    className="flex items-center justify-between p-6 hover:bg-gray-50 transition group"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition">
                                            {category.name}
                                        </h3>
                                        {category._count && (
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                <span>
                                                    {category._count.ads > 0
                                                        ? `${category._count.ads} annonce${category._count.ads > 1 ? 's' : ''}`
                                                        : 'Aucune annonce'}
                                                </span>
                                                {category._count.children > 0 && (
                                                    <span>
                                                        {category._count.children} sous-catégorie{category._count.children > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-primary transition" size={24} />
                                </Link>

                                {/* Sous-catégories */}
                                {category.children && category.children.length > 0 && (
                                    <div className="px-6 pb-6 pt-0 border-t border-gray-100">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                                            {category.children.map((child) => (
                                                <Link
                                                    key={child.id}
                                                    href={`/categories/${child.slug}`}
                                                    className="text-sm text-gray-600 hover:text-primary transition flex items-center justify-between group"
                                                >
                                                    <span className="truncate">{child.name}</span>
                                                    {child._count && child._count.ads > 0 && (
                                                        <span className="ml-2 text-xs text-gray-400">
                                                            ({child._count.ads})
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
