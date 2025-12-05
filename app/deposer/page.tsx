"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Camera, MapPin, Tag, DollarSign, Upload, X,
    AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FormData {
    title: string;
    description: string;
    price: string;
    categoryId: string;
    subcategoryId: string;
    location: string;
    condition: string;
    brand: string;
    size: string;
    deliveryAvailable: boolean;
    negotiable: boolean;
}

export default function DeposerAnnonce() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { categories, loading: categoriesLoading } = useCategories({
        type: 'hierarchy',
        withCount: false
    });
    const { uploadImages, uploading: uploadingImages } = useImageUpload();

    // États du formulaire
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        subcategoryId: '',
        location: '',
        condition: 'Neuf',
        brand: '',
        size: '',
        deliveryAvailable: false,
        negotiable: true,
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Redirection si non connecté
    if (!authLoading && !isAuthenticated) {
        router.push('/auth/login?redirect=/deposer');
        return null;
    }

    // Loading
    if (authLoading || categoriesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== newFiles.length) {
            alert('Seules les images sont acceptées');
        }

        // Limiter à 5 images max
        const totalFiles = selectedFiles.length + validFiles.length;
        if (totalFiles > 5) {
            alert('Maximum 5 images autorisées');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);

        // Créer des previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (!formData.title.trim()) {
            setError('Le titre est requis');
            return;
        }

        if (!formData.description.trim()) {
            setError('La description est requise');
            return;
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            setError('Le prix doit être supérieur à 0');
            return;
        }

        if (!formData.categoryId) {
            setError('Veuillez sélectionner une catégorie');
            return;
        }

        if (!formData.location.trim()) {
            setError('La localisation est requise');
            return;
        }

        if (selectedFiles.length === 0) {
            setError('Veuillez ajouter au moins une image');
            return;
        }

        try {
            setSubmitting(true);

            // 1. Upload des images
            const imageUrls = await uploadImages(selectedFiles);

            // 2. Créer l'annonce
            const adData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                categoryId: formData.subcategoryId || formData.categoryId,
                userId: user?.id,
                location: formData.location.trim(),
                condition: formData.condition,
                brand: formData.brand.trim() || undefined,
                size: formData.size.trim() || undefined,
                images: imageUrls,
                deliveryAvailable: formData.deliveryAvailable,
                negotiable: formData.negotiable,
            };

            const response = await fetch('/api/ads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(adData),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création de l\'annonce');
            }

            const result = await response.json();

            if (result.success) {
                setSuccess(true);

                // Redirection vers l'annonce créée après 2 secondes
                setTimeout(() => {
                    router.push(`/annonces/${result.data.id}`);
                }, 2000);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
        } catch (err) {
            console.error('Error creating ad:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCat = categories.find(cat => cat.id === formData.categoryId);
    const isLoading = submitting || uploadingImages;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">Déposer une annonce</h1>
                        <p className="mt-2 text-orange-100">
                            Bonjour {user?.name}, vendez vos articles en quelques clics.
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                            <div className="text-green-700 text-sm">
                                <p className="font-semibold">Annonce créée avec succès !</p>
                                <p>Redirection en cours...</p>
                            </div>
                        </div>
                    )}

                    <form className="p-6 sm:p-8 space-y-8" onSubmit={handleSubmit}>

                        {/* Images */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Camera className="text-primary" size={24} />
                                Photos (1-5)
                            </h2>

                            {/* Preview des images */}
                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                            >
                                                <X size={16} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                                    Photo principale
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload */}
                            {selectedFiles.length < 5 && (
                                <label className="block">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition">
                                        <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                                        <p className="text-sm text-gray-600">
                                            Cliquez pour ajouter des images
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Maximum 5 images (JPG, PNG)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        disabled={isLoading}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Détails */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Tag className="text-primary" size={24} />
                                Détails de l'annonce
                            </h2>

                            {/* Titre */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Titre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                    placeholder="Ex: iPhone 14 Pro Max - Comme neuf"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition resize-none"
                                    placeholder="Décrivez votre article en détail..."
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Catégorie */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            setFormData(prev => ({ ...prev, subcategoryId: '' }));
                                        }}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="">Choisir une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Sous-catégorie */}
                                {selectedCat && selectedCat.children && selectedCat.children.length > 0 && (
                                    <div>
                                        <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                            Sous-catégorie
                                        </label>
                                        <select
                                            id="subcategoryId"
                                            name="subcategoryId"
                                            value={formData.subcategoryId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                                            disabled={isLoading}
                                        >
                                            <option value="">Choisir (optionnel)</option>
                                            {selectedCat.children.map(child => (
                                                <option key={child.id} value={child.id}>{child.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Prix et Localisation */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Prix (DZD) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="0"
                                            min="0"
                                            step="1"
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Localisation <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                            placeholder="Ville ou Wilaya"
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Caractéristiques */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                                        État
                                    </label>
                                    <select
                                        id="condition"
                                        name="condition"
                                        value={formData.condition}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                                        disabled={isLoading}
                                    >
                                        <option value="Neuf">Neuf</option>
                                        <option value="Très bon état">Très bon état</option>
                                        <option value="Bon état">Bon état</option>
                                        <option value="Satisfaisant">Satisfaisant</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                        Marque
                                    </label>
                                    <input
                                        type="text"
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        placeholder="Ex: Apple"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                        Taille
                                    </label>
                                    <input
                                        type="text"
                                        id="size"
                                        name="size"
                                        value={formData.size}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                                        placeholder="Ex: 256 GB"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="deliveryAvailable"
                                        checked={formData.deliveryAvailable}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                        disabled={isLoading}
                                    />
                                    <span className="text-gray-700">Livraison disponible</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="negotiable"
                                        checked={formData.negotiable}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                                        disabled={isLoading}
                                    />
                                    <span className="text-gray-700">Prix négociable</span>
                                </label>
                            </div>
                        </div>

                        {/* Bouton Submit */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        {uploadingImages ? 'Upload des images...' : 'Création en cours...'}
                                    </>
                                ) : (
                                    <>
                                        <Upload size={20} />
                                        Publier l'annonce
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
