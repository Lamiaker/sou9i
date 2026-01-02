"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin, Phone, Clock,
    ShieldCheck, ChevronRight, ChevronLeft, Eye
} from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";
import ReportButton from "@/components/ui/ReportButton";
import ShareButton from "@/components/ui/ShareButton";
import ContactSellerButton from "@/components/messages/ContactSellerButton";
import { DynamicFieldsDisplay } from "@/components/forms/DynamicFieldsInput";
import type { DynamicFieldValue } from "@/types";

/**
 * Informations du vendeur pour l'affichage
 */
interface AdUser {
    id: string;
    name: string | null;
    avatar: string | null;
    city: string | null;
    phone: string | null;
    isVerified: boolean;
    createdAt: string;
}

/**
 * Catégorie associée à l'annonce
 */
interface AdCategory {
    id: string;
    name: string;
    slug: string;
}

/**
 * Données complètes de l'annonce pour le détail
 */
interface AdData {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    images: string[];
    views: number;
    createdAt: string;
    contactPhone: string | null;
    user: AdUser;
    category: AdCategory | null;
    dynamicFields: DynamicFieldValue[];
}

/**
 * Annonce similaire simplifiée
 */
interface SimilarAd {
    id: string;
    title: string;
    price: number;
    location: string;
    images: string[];
}

interface AdDetailClientProps {
    ad: AdData;
    similarAds: SimilarAd[];
}

export default function AdDetailClient({ ad, similarAds }: AdDetailClientProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        return date.toLocaleDateString('fr-FR');
    };

    // Filtrer les annonces similaires (exclure l'annonce actuelle)
    const filteredSimilarAds = similarAds.filter(similarAd => similarAd.id !== ad.id).slice(0, 4);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6 overflow-x-auto scrollbar-hide">
                    <Link href="/" className="hover:text-primary whitespace-nowrap">Accueil</Link>
                    <ChevronRight size={16} className="mx-2 flex-shrink-0" />
                    {
                        ad.category && (
                            <>
                                <Link
                                    href={`/categories/${ad.category.slug}`}
                                    className="hover:text-primary whitespace-nowrap"
                                >
                                    {ad.category.name}
                                </Link>
                                <ChevronRight size={16} className="mx-2 flex-shrink-0" />
                            </>
                        )
                    }
                    <span className="text-gray-900 font-medium truncate">{ad.title}</span>
                </nav >

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                {ad.images && ad.images.length > 0 ? (
                                    <Image
                                        src={ad.images[currentImageIndex]}
                                        alt={ad.title}
                                        fill
                                        className="object-contain"
                                        priority
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Aucune image
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {ad.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}

                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                                    {currentImageIndex + 1} / {ad.images.length}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {ad.images.length > 1 && (
                                <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
                                    {ad.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImageIndex === idx ? "border-primary" : "border-transparent"
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ad Details */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                                    <p className="text-3xl font-bold text-primary">{formatPrice(ad.price)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <FavoriteButton adId={ad.id} size={24} className="hover:bg-red-50" />
                                    <ShareButton
                                        url={typeof window !== 'undefined' ? window.location.href : ""}
                                        title={ad.title}
                                        description={ad.description}
                                        size={24}
                                        className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {formatDate(ad.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {ad.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye size={16} />
                                    {ad.views} vues
                                </div>
                                <ReportButton
                                    adId={ad.id}
                                    adTitle={ad.title}
                                    variant="text"
                                />
                            </div>

                            {/* Champs dynamiques / Caractéristiques */}
                            {ad.dynamicFields && ad.dynamicFields.length > 0 && (
                                <div className="mb-8 mt-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                                    <DynamicFieldsDisplay fields={ad.dynamicFields} />
                                </div>
                            )}

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                <div className="prose prose-sm text-gray-700 whitespace-pre-line break-words overflow-hidden">
                                    {ad.description}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Localisation</h2>
                                <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                                    <MapPin className="text-primary mt-1" size={24} />
                                    <div>
                                        <p className="font-medium text-gray-900">{ad.location}</p>
                                        <p className="text-sm text-gray-500">Adresse complète disponible après contact.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="space-y-6">

                        {/* Seller Card */}
                        {ad.user && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full overflow-hidden relative bg-gray-100 border border-gray-100">
                                            <Image
                                                src={ad.user.avatar || "/user.png"}
                                                alt={ad.user.name || "Vendeur"}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        {ad.user.isVerified && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Vendeur vérifié">
                                                <ShieldCheck size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{ad.user.name || "Vendeur"}</h3>
                                        {ad.user.city && (
                                            <p className="text-sm text-gray-500">{ad.user.city}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowPhone(!showPhone)}
                                        className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                                    >
                                        <Phone size={20} />
                                        {showPhone
                                            ? (ad.contactPhone || ad.user.phone || "Numéro non renseigné")
                                            : "Voir le numéro"}
                                    </button>

                                    <ContactSellerButton
                                        sellerId={ad.user.id}
                                        sellerName={ad.user.name || undefined}
                                        adId={ad.id}
                                        adTitle={ad.title}
                                        variant="outline"
                                        fullWidth
                                    />
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                    <p className="flex items-center gap-2">
                                        <Clock size={14} />
                                        Membre depuis {new Date(ad.user.createdAt).getFullYear()}
                                    </p>
                                    <ReportButton
                                        userId={ad.user.id}
                                        userName={ad.user.name || 'Vendeur'}
                                        variant="text"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Safety Tips */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <ShieldCheck size={18} />
                                Conseils de sécurité
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                                <li>Ne payez jamais à l'avance.</li>
                                <li>Rencontrez le vendeur dans un lieu public.</li>
                                <li>Vérifiez l'objet avant de l'acheter.</li>
                                <li>Méfiez-vous des prix trop bas.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Similar Ads */}
                {
                    filteredSimilarAds.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Annonces similaires</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredSimilarAds.map((similarAd) => (
                                    <Link href={`/annonces/${similarAd.id}`} key={similarAd.id} className="group">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className="aspect-[4/3] relative bg-gray-100">
                                                {similarAd.images[0] ? (
                                                    <Image
                                                        src={similarAd.images[0]}
                                                        alt={similarAd.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition duration-300"
                                                        unoptimized
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-400">
                                                        Pas d'image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition">
                                                    {similarAd.title}
                                                </h3>
                                                <p className="text-lg font-bold text-primary mt-1">
                                                    {formatPrice(similarAd.price)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {similarAd.location}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }

            </div >
        </div >
    );
}
