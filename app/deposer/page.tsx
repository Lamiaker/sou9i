"use client";

import { useState } from "react";
import { Camera, MapPin, ChevronRight, Upload, X } from "lucide-react";
import categories from "@/app/Data/categories";

export default function DeposerAnnonce() {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
    const [images, setImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        // Specific fields
        size: "",
        brand: "",
        condition: "",
        surface: "",
        rooms: "",
        year: "",
        mileage: "",
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map((file) =>
                URL.createObjectURL(file)
            );
            setImages((prev) => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCategorySelect = (categoryName: string) => {
        setSelectedCategory(categoryName);
        setSelectedSubCategory(""); // Reset subcategory
    };

    const isMode = selectedCategory === "Mode";
    const isImmo = selectedCategory === "Immobilier";
    const isAuto = selectedCategory === "Véhicules";

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b px-6 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">Déposer une annonce</h1>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* 1. Categorie */}
                    <section>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            1. Choisissons une catégorie
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Catégorie
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategorySelect(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map((cat) => (
                                        <option key={cat.name} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCategory && (
                                <div className="space-y-2 animate-fadeIn">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sous-catégorie
                                    </label>
                                    <select
                                        value={selectedSubCategory}
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                    >
                                        <option value="">Sélectionner une sous-catégorie</option>
                                        {categories
                                            .find((c) => c.name === selectedCategory)
                                            ?.sousCategories.map((sub) => (
                                                <option key={sub.titre} value={sub.titre}>
                                                    {sub.titre}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Details */}
                    <section className="border-t pt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            2. Décrivez votre bien
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Titre de l'annonce <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: iPhone 12 Pro Max 256Go"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Dites-en plus sur votre bien..."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                                />
                            </div>

                            {/* Dynamic Fields */}
                            {isMode && (
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Taille</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: M, 38, 42..."
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.size}
                                            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Marque</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Zara, Nike..."
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">État</label>
                                        <select
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.condition}
                                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        >
                                            <option value="">Sélectionner</option>
                                            <option value="neuf">Neuf avec étiquette</option>
                                            <option value="neuf_sans_etiquette">Neuf sans étiquette</option>
                                            <option value="tres_bon_etat">Très bon état</option>
                                            <option value="bon_etat">Bon état</option>
                                            <option value="satisfaisant">Satisfaisant</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {isImmo && (
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Surface (m²)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.surface}
                                            onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Pièces</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.rooms}
                                            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {isAuto && (
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Année-Modèle</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.year}
                                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Kilométrage</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-orange-500"
                                            value={formData.mileage}
                                            onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </section>

                    {/* 3. Prix */}
                    <section className="border-t pt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            3. Quel est votre prix ?
                        </h2>
                        <div className="max-w-xs">
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0"
                                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-lg font-semibold"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                                    DA
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. Photos */}
                    <section className="border-t pt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            4. Ajoutez des photos
                        </h2>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={img} alt="Upload" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 font-medium text-center px-2">
                                    Ajouter des photos
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            Vous pouvez ajouter jusqu'à 10 photos.
                        </p>
                    </section>

                    {/* 5. Localisation */}
                    <section className="border-t pt-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            5. Où se trouve votre bien ?
                        </h2>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Ville ou code postal"
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                            />
                        </div>
                    </section>

                    {/* Submit */}
                    <div className="pt-8 border-t flex justify-end">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform active:scale-95 text-lg">
                            Publier l'annonce
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
