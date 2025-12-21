"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Filter, SlidersHorizontal } from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
    description?: string | null;
    parent?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    children?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

interface Ad {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    images: string[];
    categoryId: string;
    status: string;
    createdAt: string;
}

interface CategoryAdsClientProps {
    category: Category;
    initialAds: Ad[];
}

export default function CategoryAdsClient({ category, initialAds }: CategoryAdsClientProps) {
    // States pour les filtres
    const [ads, setAds] = useState<Ad[]>(initialAds);
    const [loading, setLoading] = useState(false);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');

    // Mettre à jour les annonces quand initialAds change
    useEffect(() => {
        setAds(initialAds);
    }, [initialAds]);

    // Récupérer les annonces quand les filtres changent
    useEffect(() => {
        // Si aucun filtre n'est appliqué, utiliser les données initiales
        if (!selectedSubcategory && !priceMin && !priceMax && !locationFilter) {
            setAds(initialAds);
            return;
        }

        const fetchFilteredAds = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('categoryId', category.id);
                if (selectedSubcategory) params.append('subcategoryId', selectedSubcategory);
                if (priceMin) params.append('minPrice', priceMin);
                if (priceMax) params.append('maxPrice', priceMax);
                if (locationFilter) params.append('location', locationFilter);
                params.append('status', 'active');

                const response = await fetch(`/api/ads?${params.toString()}`);
                const data = await response.json();

                if (data.success) {
                    setAds(Array.isArray(data.data) ? data.data : []);
                }
            } catch (error) {
                console.error('Error fetching ads:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredAds();
    }, [category.id, selectedSubcategory, priceMin, priceMax, locationFilter, initialAds]);

    // Trier les annonces côté client
    const sortedAds = useMemo(() => {
        const result = [...ads];
        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'recent':
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return result;
    }, [ads, sortBy]);

    const hasFilters = selectedSubcategory || priceMin || priceMax || locationFilter;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <button
                className="lg:hidden flex items-center justify-center gap-2 w-full bg-white p-3 rounded-xl shadow-sm border border-gray-200 font-semibold text-gray-700"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter size={20} />
                {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
            </button>

            {/* Sidebar Filters */}
            <aside className={`w-full lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Sous-catégories */}
                {category.children && category.children.length > 0 && (
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <SlidersHorizontal size={18} />
                            Sous-catégories
                        </h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="subcategory"
                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                    checked={selectedSubcategory === null}
                                    onChange={() => setSelectedSubcategory(null)}
                                />
                                <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === null ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                    Tout voir
                                </span>
                            </label>

                            {category.children.map((child) => (
                                <label key={child.id} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="subcategory"
                                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                        checked={selectedSubcategory === child.id}
                                        onChange={() => setSelectedSubcategory(child.id)}
                                    />
                                    <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === child.id ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        {child.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price Filter */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Prix (DZD)</h3>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                        <input
                            type="number"
                            placeholder="Max"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                    </div>
                </div>

                {/* Location Filter */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Localisation</h3>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Ville ou Wilaya"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                        />
                    </div>
                </div>

                {/* Reset Filters */}
                {hasFilters && (
                    <button
                        onClick={() => {
                            setSelectedSubcategory(null);
                            setPriceMin('');
                            setPriceMax('');
                            setLocationFilter('');
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {/* Results Count & Sort */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 text-sm">
                        {loading ? (
                            'Chargement...'
                        ) : (
                            <>
                                <strong>{sortedAds.length}</strong> annonce{sortedAds.length > 1 ? 's' : ''} trouvée{sortedAds.length > 1 ? 's' : ''}
                            </>
                        )}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 hidden sm:inline">Trier par:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 outline-none focus:border-primary"
                        >
                            <option value="recent">Plus récents</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                        </select>
                    </div>
                </div>

                {/* Ads Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                                <div className="aspect-[4/3] bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedAds.map((ad) => (
                            <Link href={`/annonces/${ad.id}`} key={ad.id} className="group">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                                    <div className="aspect-[4/3] relative bg-gray-100">
                                        <Image
                                            src={ad.images[0] || '/user.png'}
                                            alt={ad.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition duration-300"
                                            unoptimized
                                        />
                                        <div className="absolute top-3 right-3">
                                            <FavoriteButton adId={ad.id} size={18} />
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition mb-1">
                                                {ad.title}
                                            </h3>
                                            <p className="text-lg font-bold text-primary">
                                                {ad.price.toLocaleString('fr-DZ')} DZD
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                {ad.location}
                                            </div>
                                            <span>{new Date(ad.createdAt).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Aucune annonce trouvée</h3>
                        <p className="text-gray-500 mt-2">
                            {hasFilters
                                ? 'Essayez de changer les filtres ou revenez plus tard.'
                                : 'Aucune annonce n\'est disponible dans cette catégorie pour le moment.'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
