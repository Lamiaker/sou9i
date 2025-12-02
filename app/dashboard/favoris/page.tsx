"use client";

import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Trash2 } from "lucide-react";
import { gateauxProducts, decorationProducts, beauteProducts, enfantProducts } from "@/lib/data/featuredCategories";

// Function to find ad by ID from all products
const findAdById = (id: string) => {
    const allProducts = [
        ...gateauxProducts,
        ...decorationProducts,
        ...beauteProducts,
        ...enfantProducts
    ];
    return allProducts.find(p => p.id === id);
};

export default function FavorisPage() {
    const { favorites, toggleFavorite } = useFavorites();

    // Get full ad data for each favorite
    const favoriteAds = favorites
        .map(id => findAdById(id))
        .filter(ad => ad !== undefined); // Filter out any that weren't found

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                <p className="text-gray-500 mt-2">
                    {favorites.length} {favorites.length <= 1 ? 'annonce' : 'annonces'} en favori
                </p>
            </div>

            {favoriteAds.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteAds.map((ad) => (
                        <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col relative group">
                            <Link href={`/annonces/${ad.id}`}>
                                <div className="aspect-[4/3] relative bg-gray-100">
                                    <Image
                                        src={ad.photos[0] || "https://via.placeholder.com/300"}
                                        alt={ad.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-300"
                                    />

                                    {/* Delete from favorites button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(ad.id);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition z-10"
                                        title="Retirer des favoris"
                                    >
                                        <Heart size={18} fill="currentColor" />
                                    </button>
                                </div>
                            </Link>

                            <div className="p-4 flex flex-col flex-1">
                                <Link href={`/annonces/${ad.id}`}>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition mb-1">
                                            {ad.title}
                                        </h3>
                                        <p className="text-lg font-bold text-primary">{ad.price}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {ad.location || "Algérie"}
                                        </div>
                                        <span>{ad.postedTime || "Récemment"}</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Aucun favori</h3>
                    <p className="text-gray-500 mt-2 mb-6">
                        Vous n'avez pas encore ajouté d'annonces à vos favoris.
                    </p>
                    <Link
                        href="/search?q="
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition"
                    >
                        Parcourir les annonces
                    </Link>
                </div>
            )}
        </div>
    );
}
