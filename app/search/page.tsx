"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Filter, Search } from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Helper for formatting price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        maximumFractionDigits: 0,
    }).format(price);
};

export default function SearchPage() {
    const searchParams = useSearchParams();
    // Initialize query from URL, but also allow local state updates if needed
    const initialQuery = searchParams?.get("q") ?? "";

    // States
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        categoryId: "Toutes",
        minPrice: "",
        maxPrice: "",
        location: "",
    });

    // Update query if URL changes
    useEffect(() => {
        setQuery(searchParams?.get("q") ?? "");
    }, [searchParams]);

    // 1. Fetch Categories for the dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories?type=parents");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setCategories(data.data);
                    }
                }
            } catch (error) {
                console.error("Erreur chargement catégories", error);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Ads based on filters & query
    const fetchAds = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set("search", query);
            if (filters.categoryId !== "Toutes") params.set("categoryId", filters.categoryId);
            if (filters.minPrice) params.set("minPrice", filters.minPrice);
            if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
            if (filters.location) params.set("location", filters.location);

            // Default params
            params.set("limit", "24");
            params.set("status", "active");

            const res = await fetch(`/api/ads?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setResults(data.data);
                }
            }
        } catch (error) {
            console.error("Erreur chargement annonces", error);
        } finally {
            setLoading(false);
        }
    }, [query, filters]);

    // Trigger fetch when dependencies change
    // Using a timeout for simple debouncing of text inputs
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAds();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [fetchAds]);


    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Toggle */}
                    <button
                        className="lg:hidden flex items-center justify-center gap-2 w-full bg-white p-3 rounded-xl shadow-sm border border-gray-200 font-semibold text-gray-700"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={20} />
                        {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
                    </button>

                    {/* Filters Sidebar */}
                    <aside className={`w-full lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-gray-900 font-semibold">
                                <Filter size={20} />
                                Filtres
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                        value={filters.categoryId}
                                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                                    >
                                        <option value="Toutes">Toutes les catégories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Ville, Wilaya..."
                                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DZD)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Results List */}
                    <main className="flex-1">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {loading ? "Recherche en cours..." : `${results.length} résultats pour "${query}"`}
                            </h1>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-xl h-[350px] animate-pulse">
                                        <div className="h-[200px] bg-gray-200 rounded-t-xl"></div>
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-10 bg-gray-200 rounded mt-4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((ad) => (
                                    <Link href={`/annonces/${ad.id}`} key={ad.id} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col relative">
                                            <div className="aspect-[4/3] relative bg-gray-100">
                                                <Image
                                                    src={ad.images?.[0] || "/user.png"}
                                                    alt={ad.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition duration-300"
                                                    unoptimized
                                                />
                                                <div className="absolute top-3 right-3 z-10">
                                                    <FavoriteButton adId={ad.id} size={18} />
                                                </div>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition mb-1">
                                                        {ad.title}
                                                    </h3>
                                                    <p className="text-lg font-bold text-primary">{formatPrice(ad.price)}</p>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {ad.location || "Algérie"}
                                                    </div>
                                                    <span>
                                                        {ad.createdAt ? formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: fr }) : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Aucun résultat trouvé</h3>
                                <p className="text-gray-500 mt-2">Essayez de modifier vos termes de recherche ou vos filtres.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
