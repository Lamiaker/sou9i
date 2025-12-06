"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        maximumFractionDigits: 0,
    }).format(price);
};

export default function FavorisPage() {
    const { data: session, status } = useSession();
    const { toggleFavorite } = useFavorites();
    const [favoritesList, setFavoritesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            if (status === "loading") return;

            if (status === "authenticated" && session?.user?.id) {
                try {
                    const response = await fetch(`/api/favorites?userId=${session.user.id}`);
                    if (response.ok) {
                        const resData = await response.json();
                        if (resData.success) {
                            setFavoritesList(resData.data);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
            } else {
                // If not logged in, we rely on existing logic or show empty.
                // Since this is a dashboard page, we assume auth.
                // Unauthenticated users will see empty or redirect (middleware handles protection usually).
                // However, if we want to support local favorites display here:
                // We'd need to fetch Ad details for IDs in localStorage.
                // For now, let's keep it simple and focus on authenticated users as per backend integration request.
            }
            setLoading(false);
        };

        fetchFavorites();
    }, [session, status]);

    // Update list if an item is removed via the button (without refetching)
    const handleRemove = async (adId: string) => {
        await toggleFavorite(adId);
        setFavoritesList(prev => prev.filter(item => item.adId !== adId));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (favoritesList.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center items-center flex flex-col">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Aucun favori</h3>
                <p className="text-gray-500 mt-2 mb-6">
                    Vous n'avez pas encore ajouté d'annonces à vos favoris.
                </p>
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition"
                >
                    Parcourir les annonces
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                <p className="text-gray-500 mt-2">
                    {favoritesList.length} {favoritesList.length <= 1 ? 'annonce' : 'annonces'} en favori
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoritesList.map((item) => {
                    const ad = item.ad;
                    // Handle image array (schema: images, frontend mockup: photos)
                    const imageSrc = (ad.images && ad.images.length > 0) ? ad.images[0] : (ad.photos && ad.photos.length > 0 ? ad.photos[0] : "https://via.placeholder.com/300");

                    return (
                        <div key={item.id || item.adId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col relative group">
                            <Link href={`/annonces/${ad.id}`}>
                                <div className="aspect-[4/3] relative bg-gray-100">
                                    <Image
                                        src={imageSrc}
                                        alt={ad.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition duration-300"
                                    />

                                    {/* Delete from favorites button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleRemove(ad.id);
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
                                        <p className="text-lg font-bold text-primary">{formatPrice(ad.price)}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} />
                                            {ad.location || "Algérie"}
                                        </div>
                                        <span>
                                            {ad.createdAt ? formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: fr }) : "Récemment"}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
