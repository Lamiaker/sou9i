"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { categories } from "@/app/Data/categories";

// Mock Data for Category Pages
const categoryAds = [
    {
        id: 101,
        title: "Plateau de Baklawa aux amandes",
        price: "4,500 DZD",
        location: "Alger Centre",
        image: "https://images.unsplash.com/photo-1587241321921-9ac58f433800?auto=format&fit=crop&w=400&q=80",
        category: "Gâteaux & Pâtisserie",
        subcategory: "Gâteaux traditionnels",
        date: "Aujourd'hui, 09:00",
    },
    {
        id: 102,
        title: "Layer Cake Anniversaire",
        price: "7,000 DZD",
        location: "Oran",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80",
        category: "Gâteaux & Pâtisserie",
        subcategory: "Gâteaux modernes",
        date: "Hier, 15:30",
    },
    {
        id: 103,
        title: "Décoration Mariage Bohème",
        price: "Sur devis",
        location: "Blida",
        image: "https://images.unsplash.com/photo-1519225468063-3f721174a3b2?auto=format&fit=crop&w=400&q=80",
        category: "Décoration & Événements",
        subcategory: "Organisation d’événements",
        date: "28 Nov",
    },
    {
        id: 104,
        title: "Robe Kabyle Moderne",
        price: "15,000 DZD",
        location: "Tizi Ouzou",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
        category: "Mode & Beauté",
        subcategory: "Vêtements femmes",
        date: "Aujourd'hui, 11:15",
    },
    {
        id: 105,
        title: "Maquillage Mariée",
        price: "20,000 DZD",
        location: "Constantine",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
        category: "Services Femmes",
        subcategory: "Beauté & soins",
        date: "Hier, 10:00",
    },
    {
        id: 106,
        title: "Trousseau Bébé Complet",
        price: "12,000 DZD",
        location: "Setif",
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80",
        category: "Bébé & Enfants",
        subcategory: "Vêtements enfants",
        date: "25 Nov",
    },
];

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Find the current category based on the slug
    const currentCategory = categories.find(c => c.link === `/${slug}`);

    const [ads, setAds] = useState(categoryAds);
    const [selectedSubcategory, setSelectedSubcategory] = useState("Tout");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (currentCategory) {
            // Filter ads by the current category name
            const filtered = categoryAds.filter(ad => ad.category === currentCategory.name);

            if (selectedSubcategory !== "Tout") {
                setAds(filtered.filter(ad => ad.subcategory === selectedSubcategory));
            } else {
                setAds(filtered);
            }
        }
    }, [currentCategory, selectedSubcategory]);

    if (!currentCategory) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Catégorie non trouvée</h1>
                    <Link href="/" className="text-primary hover:underline">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-primary">Accueil</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{currentCategory.name}</span>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">{currentCategory.name}</h1>
                    <p className="text-gray-500 mt-2">Découvrez les meilleures annonces pour {currentCategory.name.toLowerCase()}.</p>
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

                        {/* Subcategories Filter */}
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
                                        checked={selectedSubcategory === "Tout"}
                                        onChange={() => setSelectedSubcategory("Tout")}
                                    />
                                    <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === "Tout" ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                        Tout voir
                                    </span>
                                </label>

                                {currentCategory.sousCategories.map((sub, idx) => (
                                    <label key={idx} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="subcategory"
                                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                            checked={selectedSubcategory === sub.titre}
                                            onChange={() => setSelectedSubcategory(sub.titre)}
                                        />
                                        <span className={`text-sm group-hover:text-primary transition ${selectedSubcategory === sub.titre ? "text-gray-900 font-medium" : "text-gray-600"}`}>
                                            {sub.titre}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Filter (Mock) */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Prix</h3>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                                />
                            </div>
                        </div>

                        {/* Location Filter (Mock) */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Localisation</h3>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Ville ou Wilaya"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary bg-gray-50"
                                />
                            </div>
                        </div>

                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">

                        {/* Results Count & Sort */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 text-sm">
                                <strong>{ads.length}</strong> annonces trouvées
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 hidden sm:inline">Trier par:</span>
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                    Plus récents <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Ads Grid */}
                        {ads.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ads.map((ad) => (
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
                                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                                                    {ad.subcategory}
                                                </div>
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
                                    <Filter size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Aucune annonce trouvée</h3>
                                <p className="text-gray-500 mt-2">Essayez de changer les filtres ou revenez plus tard.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
