"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart, Filter, ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { categories } from "@/lib/data/categories";
import { gateauxProducts, decorationProducts, beauteProducts, enfantProducts } from "@/lib/data/featuredCategories";

// Combine all products into a single list for search
const getAllAds = () => {
    const normalize = (products: any[], categoryName: string) => {
        return products.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            location: p.location || "Algérie",
            image: p.photos?.[0] || p.image || "https://via.placeholder.com/300",
            category: categoryName,
            date: p.postedTime || "Récemment",
        }));
    };

    return [
        ...normalize(gateauxProducts, "Gâteaux & Pâtisserie"),
        ...normalize(decorationProducts, "Décoration & Événements"),
        ...normalize(beauteProducts, "Mode & Beauté"),
        ...normalize(enfantProducts, "Bébé & Enfants"),

        // Add other mappings as needed
    ];
};

const allAds = getAllAds();

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState(allAds);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: "Toutes",
        minPrice: "",
        maxPrice: "",
        location: "",
    });

    useEffect(() => {
        // Simple client-side filtering
        const filtered = allAds.filter((ad) => {
            const matchesQuery = ad.title.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = filters.category === "Toutes" || ad.category === filters.category;
            const matchesLocation = !filters.location || ad.location.toLowerCase().includes(filters.location.toLowerCase());

            // Basic price filtering (parsing "4,500 DZD" -> 4500)
            let matchesPrice = true;
            if (filters.minPrice || filters.maxPrice) {
                const priceValue = parseInt(ad.price.toString().replace(/[^0-9]/g, '')) || 0;
                if (filters.minPrice && priceValue < parseInt(filters.minPrice)) matchesPrice = false;
                if (filters.maxPrice && priceValue > parseInt(filters.maxPrice)) matchesPrice = false;
            }

            return matchesQuery && matchesCategory && matchesLocation && matchesPrice;
        });
        setResults(filtered);
    }, [query, filters]);

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
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="Toutes">Toutes les catégories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.name} value={cat.name}>
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
                                {results.length} résultats pour "{query}"
                            </h1>
                        </div>

                        {results.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((ad) => (
                                    <Link href={`/annonces/${ad.id}`} key={ad.id} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                                            <div className="aspect-[4/3] relative bg-gray-100">
                                                <Image
                                                    src={ad.image}
                                                    alt={ad.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition duration-300"
                                                />
                                                <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-red-500 transition shadow-sm">
                                                    <Heart size={18} />
                                                </button>
                                            </div>
                                            <div className="p-4 flex flex-col flex-1">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition mb-1">
                                                        {ad.title}
                                                    </h3>
                                                    <p className="text-lg font-bold text-primary">{ad.price}</p>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {ad.location}
                                                    </div>
                                                    <span>{ad.date}</span>
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
