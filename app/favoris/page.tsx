"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, LogIn, Loader2 } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import AdCard from "@/components/ui/AdCard";

interface Ad {
    id: string;
    title: string;
    price: number;
    images: string[];
    location: string;
    createdAt: string;
}

export default function PublicFavorisPage() {
    const { data: session, status } = useSession();
    const { favorites, toggleFavorite, isLoading: favoritesLoading, isSyncing } = useFavorites();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);

    // Charger les détails des annonces favorites
    useEffect(() => {
        const fetchAdsDetails = async () => {
            if (favoritesLoading) return;

            if (favorites.length === 0) {
                setAds([]);
                setLoading(false);
                return;
            }

            try {
                // Fetch les détails des annonces par leurs IDs
                const adsData: Ad[] = [];

                // Fetch en batch (max 10 à la fois pour éviter les surcharges)
                const batchSize = 10;
                for (let i = 0; i < favorites.length; i += batchSize) {
                    const batch = favorites.slice(i, i + batchSize);

                    const promises = batch.map(async (adId) => {
                        try {
                            const response = await fetch(`/api/ads/${adId}`);
                            if (response.ok) {
                                const data = await response.json();
                                if (data.success && data.data) {
                                    return data.data as Ad;
                                }
                            }
                        } catch {
                            console.error(`Erreur fetch annonce ${adId}`);
                        }
                        return null;
                    });

                    const results = await Promise.all(promises);
                    results.forEach(ad => {
                        if (ad) adsData.push(ad);
                    });
                }

                setAds(adsData);
            } catch (error) {
                console.error("Erreur chargement annonces:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdsDetails();
    }, [favorites, favoritesLoading]);

    // Supprimer un favori
    const handleRemove = async (adId: string) => {
        await toggleFavorite(adId);
        setAds(prev => prev.filter(ad => ad.id !== adId));
    };

    // État de chargement
    if (favoritesLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-gray-500">Chargement de vos favoris...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Aucun favori
    if (favorites.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                        <p className="text-gray-500 mt-2">
                            {status === "authenticated" ? "Gérez vos annonces favorites" : "Vos annonces sauvegardées"}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center items-center flex flex-col">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Aucun favori</h3>
                        <p className="text-gray-500 mt-2 mb-6 max-w-md">
                            {status === "authenticated"
                                ? "Vous n'avez pas encore ajouté d'annonces à vos favoris."
                                : "Parcourez les annonces et cliquez sur le ❤️ pour les sauvegarder ici."
                            }
                        </p>
                        <Link
                            href="/search"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition"
                        >
                            Parcourir les annonces
                        </Link>
                    </div>

                    {/* Invitation à se connecter pour les visiteurs */}
                    {status === "unauthenticated" && (
                        <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <LogIn className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        Connectez-vous pour ne rien perdre !
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Vos favoris sont actuellement stockés sur cet appareil.
                                        Connectez-vous pour les synchroniser et y accéder depuis n&apos;importe où.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary transition"
                                        >
                                            Se connecter
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                        >
                                            Créer un compte
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                            <p className="text-gray-500 mt-2">
                                {ads.length} {ads.length <= 1 ? 'annonce' : 'annonces'} en favori
                                {isSyncing && (
                                    <span className="ml-2 text-primary">
                                        <Loader2 className="w-4 h-4 inline animate-spin mr-1" />
                                        Synchronisation...
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Info visiteur */}
                    {status === "unauthenticated" && (
                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-800">
                                💡 <strong>Astuce :</strong> Vos favoris sont stockés localement sur cet appareil.
                                <Link href="/login" className="text-primary hover:underline ml-1">Connectez-vous</Link> pour les synchroniser et y accéder depuis tous vos appareils.
                            </p>
                        </div>
                    )}
                </div>

                {/* Grille des favoris */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ads.map((ad) => (
                        <AdCard
                            key={ad.id}
                            id={ad.id}
                            title={ad.title}
                            price={ad.price}
                            images={ad.images}
                            location={ad.location}
                            createdAt={ad.createdAt}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>

                {/* Annonces supprimées/invalides */}
                {favorites.length > ads.length && (
                    <div className="mt-8 bg-gray-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600">
                            {favorites.length - ads.length} favori(s) ne sont plus disponibles (annonces supprimées ou modifiées).
                        </p>
                    </div>
                )}

                {/* CTA connexion pour visiteurs */}
                {status === "unauthenticated" && ads.length > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <LogIn className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Ne perdez pas vos favoris !
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Créez un compte gratuit pour synchroniser vos {ads.length} favoris
                                    et y accéder depuis n&apos;importe quel appareil.
                                </p>
                                <div className="flex gap-3">
                                    <Link
                                        href="/signup"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-secondary transition"
                                    >
                                        Créer un compte gratuit
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                    >
                                        J&apos;ai déjà un compte
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
