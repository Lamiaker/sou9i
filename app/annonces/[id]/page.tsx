"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPin, Phone, MessageCircle, Heart, Share2, Flag, Clock, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { adData as defaultAdData, similarAds } from "@/lib/data/adData";
import { gateauxProducts, decorationProducts, beauteProducts, enfantProducts } from "@/lib/data/featuredCategories";


// Helper to find ad by ID
const findAdById = (id: string) => {
    const allProducts = [
        ...gateauxProducts,
        ...decorationProducts,
        ...beauteProducts,
        ...enfantProducts
    ];
    return allProducts.find(p => p.id === id);
};

export default function AdDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [ad, setAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const foundProduct = findAdById(id);
            if (foundProduct) {
                // Map ProductItem to the structure expected by the UI
                setAd({
                    title: foundProduct.title,
                    price: foundProduct.price,
                    location: foundProduct.location || "Algérie",
                    date: foundProduct.postedTime || "Récemment",
                    description: foundProduct.description || "Aucune description fournie pour cet article.",
                    images: foundProduct.photos && foundProduct.photos.length > 0 ? foundProduct.photos : ["https://via.placeholder.com/800"],
                    specs: {
                        "État": foundProduct.condition || "Non spécifié",
                        "Marque": foundProduct.brand || "Non spécifié",
                        "Taille": foundProduct.size || "N/A",
                        "Livraison": foundProduct.deliveryAvailable ? "Disponible" : "Non",
                    },
                    seller: {
                        name: foundProduct.sellerName || "Vendeur",
                        avatar: foundProduct.sellerAvatar || "https://via.placeholder.com/100",
                        adsCount: 12, // Mock
                        verified: true,
                        responseRate: "Répond dans la journée",
                        joined: "Membre depuis 2024"
                    }
                });
            } else {
                // Fallback to default mock if ID not found (or handle 404)
                // For demo, we might want to just show the default one if ID=1, otherwise 404
                if (id === "1") {
                    setAd(defaultAdData);
                }
            }
            setLoading(false);
        }
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

    if (!ad) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">Annonce non trouvée</h1>
                <Link href="/" className="text-primary hover:underline">Retour à l'accueil</Link>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-primary">Accueil</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <Link href="/search" className="hover:text-primary">Annonces</Link>
                    <ChevronRight size={16} className="mx-2" />
                    <span className="text-gray-900 font-medium truncate">{ad.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Image Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="relative aspect-[4/3] bg-gray-100">
                                <Image
                                    src={ad.images[currentImageIndex]}
                                    alt={ad.title}
                                    fill
                                    className="object-contain"
                                />

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
                                <div className="flex gap-2 p-4 overflow-x-auto">
                                    {ad.images.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImageIndex === idx ? "border-primary" : "border-transparent"
                                                }`}
                                        >
                                            <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
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
                                    <p className="text-3xl font-bold text-primary">{ad.price}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
                                        <Heart size={24} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 border-b border-gray-100 pb-6">
                                <div className="flex items-center gap-1">
                                    <Clock size={16} />
                                    {ad.date}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    {ad.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Flag size={16} />
                                    Signaler
                                </div>
                            </div>

                            {/* Specifications */}
                            {ad.specs && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Caractéristiques</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(ad.specs).map(([key, value]) => (
                                            <div key={key} className="flex justify-between border-b border-gray-100 pb-2">
                                                <span className="text-gray-500">{key}</span>
                                                <span className="font-medium text-gray-900">{value as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                                <div className="prose prose-sm text-gray-700 whitespace-pre-line">
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden relative">
                                        <Image src={ad.seller.avatar} alt={ad.seller.name} fill className="object-cover" />
                                    </div>
                                    {ad.seller.verified && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Vendeur vérifié">
                                            <ShieldCheck size={12} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{ad.seller.name}</h3>
                                    <p className="text-sm text-gray-500">{ad.seller.adsCount} annonces</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setShowPhone(!showPhone)}
                                    className="w-full bg-secondary hover:bg-primary text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                                >
                                    <Phone size={20} />
                                    {showPhone ? "05 55 12 34 56" : "Voir le numéro"}
                                </button>

                                <button className="w-full bg-white border-2 border-primary text-primary hover:bg-orange-50 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2">
                                    <MessageCircle size={20} />
                                    Envoyer un message
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
                                <p className="flex items-center gap-2">
                                    <Clock size={14} />
                                    {ad.seller.responseRate}
                                </p>
                                <p>{ad.seller.joined}</p>
                            </div>
                        </div>

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
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Similar Ads */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Annonces similaires</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {similarAds.map((ad) => (
                            <Link href={`/annonces/${ad.id}`} key={ad.id} className="group">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                    <div className="aspect-[4/3] relative bg-gray-100">
                                        <Image src={ad.image} alt={ad.title} fill className="object-cover group-hover:scale-105 transition duration-300" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-primary transition">{ad.title}</h3>
                                        <p className="text-lg font-bold text-primary mt-1">{ad.price}</p>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <MapPin size={12} />
                                            {ad.location}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
