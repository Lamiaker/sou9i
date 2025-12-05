"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart, Filter, ChevronDown, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCategory } from "@/hooks/useCategories";
import FavoriteButton from "@/components/ui/FavoriteButton";

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
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Récupérer la catégorie depuis l'API
    const { category, loading: categoryLoading, error: categoryError } = useCategory(slug);

    // States
    const [ads, setAds] = useState<Ad[]>([]);
    const [adsLoading, setAdsLoading] = useState(true);
    const [adsError, setAdsError] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [locationFilter, setLocationFilter] = useState<string>('');

    // Récupérer les annonces de la catégorie
    useEffect(() => {
        const fetchAds = async () => {
            if (!category) return;

            try {
                setAdsLoading(true);
                setAdsError(null);

                // Construire les paramètres de requête
                const params = new URLSearchParams();
                params.append('categoryId', category.id);
                if (selectedSubcategory) params.append('subcategoryId', selectedSubcategory);
                if (priceMin) params.append('minPrice', priceMin);
                if (priceMax) params.append('maxPrice', priceMax);
                if (locationFilter) params.append('location', locationFilter);
                params.append('status', 'active');
                params.append('sortBy', sortBy);

                console.log('🔍 Fetching ads for category:', category.name, 'ID:', category.id);
                console.log('📡 API URL:', `/api/ads?${params.toString()}`);

                const response = await fetch(`/api/ads?${params.toString()}`);

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des annonces');
                }

                const data = await response.json();
                console.log('📦 API Response:', data);

                if (data.success) {
                    // L'API retourne { success: true, data: [...annonces...], pagination: {...} }
                    const adsArray = Array.isArray(data.data) ? data.data : [];
                    console.log(`✅ ${adsArray.length} annonce(s) trouvée(s)`);
                    setAds(adsArray);
                } else {
                    throw new Error(data.error || 'Erreur inconnue');
                }
            } catch (err) {
                setAdsError(err instanceof Error ? err.message : 'Une erreur est survenue');
                console.error('❌ Error fetching ads:', err);
            } finally {
                setAdsLoading(false);
            }
        };

        fetchAds();
    }, [category, selectedSubcategory, sortBy, priceMin, priceMax, locationFilter]);

    // Filtrer les annonces côté client (pour un rendu plus rapide)
    const filteredAds = useMemo(() => {
        let result = [...ads];

        // Tri
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

    // Loading states
    if (categoryLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Chargement de la catégorie...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (categoryError || !category) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Catégorie non trouvée</h1>
                    <p className="text-gray-500 mb-4">{categoryError || 'Cette catégorie n\'existe pas.'}</p>
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-primary hover:text-secondary transition"
                    >
                        <ArrowLeft size={20} />
                        Retour aux catégories
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-primary transition">Accueil</Link>
                        <span>/</span>
                        <Link href="/categories" className="hover:text-primary transition">Catégories</Link>
                        <span>/</span>
                        {category.parent && (
                            <>
                                <Link href={`/categories/${category.parent.slug}`} className="hover:text-primary transition">
                                    {category.parent.name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-gray-900 font-medium">{category.name}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                    {category.description && (
                        <p className="text-gray-500 mt-2">{category.description}</p>
                    )}
                    {category._count && (
                        <p className="text-sm text-gray-600 mt-2">
                            {category._count.ads} annonce{category._count.ads > 1 ? 's' : ''} disponible{category._count.ads > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

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
                                        <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === null ? "text-gray-900 font-medium" : "text-gray-600"
                                            }`}>
                                            Tout voir
                                        </span>
                                    </label>

                                    {category.children.map((child) => (
                                        <label key={child.id} className="flex items-center justify-between gap-2 cursor-pointer group">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="subcategory"
                                                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                                    checked={selectedSubcategory === child.id}
                                                    onChange={() => setSelectedSubcategory(child.id)}
                                                />
                                                <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === child.id ? "text-gray-900 font-medium" : "text-gray-600"
                                                    }`}>
                                                    {child.name}
                                                </span>
                                            </div>
                                            {child._count && child._count.ads > 0 && (
                                                <span className="text-xs text-gray-400">({child._count.ads})</span>
                                            )}
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
                        {(selectedSubcategory || priceMin || priceMax || locationFilter) && (
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
                                {adsLoading ? (
                                    'Chargement...'
                                ) : (
                                    <>
                                        <strong>{filteredAds.length}</strong> annonce{filteredAds.length > 1 ? 's' : ''} trouvée{filteredAds.length > 1 ? 's' : ''}
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
                        {adsLoading ? (
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
                        ) : filteredAds.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAds.map((ad) => (
                                    <Link href={`/annonces/${ad.id}`} key={ad.id} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                                            <div className="aspect-[4/3] relative bg-gray-100">
                                                <Image
                                                    src={ad.images[0] || '/placeholder-ad.jpg'}
                                                    alt={ad.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition duration-300"
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
                                    {selectedSubcategory || priceMin || priceMax || locationFilter
                                        ? 'Essayez de changer les filtres ou revenez plus tard.'
                                        : 'Aucune annonce n\'est disponible dans cette catégorie pour le moment.'}
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
