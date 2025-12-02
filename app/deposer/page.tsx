"use client";

import { useState } from "react";
import { Camera, MapPin, Tag, FileText, DollarSign, User, Phone, Mail, ChevronDown } from "lucide-react";
import { categories } from "@/app/Data/categories";

export default function DeposerAnnonce() {
    const [images, setImages] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">Déposer une annonce</h1>
                        <p className="mt-2 text-orange-100">Vendez, louez, ou proposez vos services en quelques clics.</p>
                    </div>

                    <form className="p-6 sm:p-8 space-y-8">

                        {/* Section: Détails de l'annonce */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Tag className="text-primary" size={24} />
                                Détails de l'annonce
                            </h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce</label>
                                    <input
                                        type="text"
                                        id="title"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        placeholder="Ex: iPhone 14 Pro Max - Comme neuf"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                                    <div className="relative">
                                        <select
                                            id="category"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none bg-white"
                                            value={selectedCategory}
                                            onChange={(e) => {
                                                setSelectedCategory(e.target.value);
                                                setSelectedSubcategory(""); // Reset subcategory when category changes
                                            }}
                                        >
                                            <option value="">Choisir une catégorie</option>
                                            {categories.map((cat) => (
                                                <option key={cat.name} value={cat.name}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                    </div>
                                </div>

                                {selectedCategory && (
                                    <div>
                                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">Sous-catégorie</label>
                                        <div className="relative">
                                            <select
                                                id="subcategory"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none bg-white"
                                                value={selectedSubcategory}
                                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                                            >
                                                <option value="">Choisir une sous-catégorie</option>
                                                {categories
                                                    .find((c) => c.name === selectedCategory)
                                                    ?.sousCategories.map((sub, idx) => (
                                                        <option key={idx} value={sub.titre}>
                                                            {sub.titre}
                                                        </option>
                                                    ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        id="description"
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                                        placeholder="Décrivez votre produit en détail..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <DollarSign className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="number"
                                            id="price"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="0.00"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">DZD</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section: Photos */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Camera className="text-primary" size={24} />
                                Photos
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-orange-50 cursor-pointer flex flex-col items-center justify-center transition group">
                                    <Camera className="text-gray-400 group-hover:text-primary transition mb-2" size={32} />
                                    <span className="text-xs text-gray-500 font-medium">Ajouter</span>
                                    <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>

                                {images.map((src, index) => (
                                    <div key={index} className="aspect-square rounded-xl overflow-hidden relative border border-gray-200">
                                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500">Ajoutez jusqu'à 10 photos. La première photo sera la photo principale.</p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section: Localisation */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="text-primary" size={24} />
                                Localisation
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                    <input
                                        type="text"
                                        id="city"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        placeholder="Ex: Alger"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse (facultatif)</label>
                                    <input
                                        type="text"
                                        id="address"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        placeholder="Quartier, rue..."
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section: Vos coordonnées */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <User className="text-primary" size={24} />
                                Vos coordonnées
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="text-gray-400" size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="05 XX XX XX XX"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Publier l'annonce
                            </button>
                            <p className="mt-4 text-center text-sm text-gray-500">
                                En publiant cette annonce, vous acceptez nos <a href="#" className="text-primary hover:underline">Conditions Générales d'Utilisation</a>.
                            </p>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
