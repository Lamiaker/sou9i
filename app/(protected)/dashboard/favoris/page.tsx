"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import AdCard from "@/components/ui/AdCard";

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
                    // L'API utilise maintenant la session serveur, pas besoin de passer userId
                    const response = await fetch('/api/favorites');
                    if (response.ok) {
                        const resData = await response.json();
                        if (resData.success) {
                            setFavoritesList(resData.data);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching favorites:", error);
                }
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
                    const images = (ad.images && ad.images.length > 0) ? ad.images : (ad.photos || []);

                    return (
                        <AdCard
                            key={item.id || item.adId}
                            id={ad.id}
                            title={ad.title}
                            price={ad.price}
                            images={images}
                            location={ad.location}
                            createdAt={ad.createdAt}
                            onRemove={handleRemove}
                        />
                    );
                })}
            </div>
        </div>
    );
}
