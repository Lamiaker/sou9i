"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import Image from "next/image";
import {
    Camera, MapPin, Tag, DollarSign, Upload, X,
    AlertCircle, CheckCircle, Loader2
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import DynamicFieldsInput from "@/components/forms/DynamicFieldsInput";
import { validateAllFields } from "@/hooks/useDynamicFields";
import { useDynamicFields } from "@/hooks/useDynamicFields";

interface FormData {
    title: string;
    description: string;
    price: string;
    categoryId: string;
    subcategoryId: string;
    location: string;
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
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // État pour les champs dynamiques
    const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
    const [dynamicFieldErrors, setDynamicFieldErrors] = useState<Record<string, string>>({});

    // Récupérer les champs dynamiques de la catégorie sélectionnée
    const effectiveCategoryId = formData.subcategoryId || formData.categoryId;
    const { fields: dynamicFields } = useDynamicFields(effectiveCategoryId);

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

    // Handler pour les champs dynamiques
    const handleDynamicFieldChange = (fieldId: string, value: string) => {
        setDynamicFieldValues(prev => ({ ...prev, [fieldId]: value }));
        // Effacer l'erreur quand l'utilisateur modifie
        if (dynamicFieldErrors[fieldId]) {
            setDynamicFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
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

        // Validation des champs dynamiques
        if (dynamicFields.length > 0) {
            const validation = validateAllFields(dynamicFields, dynamicFieldValues);
            if (!validation.valid) {
                setDynamicFieldErrors(validation.errors);
                setError('Veuillez corriger les erreurs dans les champs supplémentaires');
                return;
            }
        }

        try {
            setSubmitting(true);

            // Temps minimum pour garantir une bonne UX (utilisateur voit le feedback)
            const startTime = Date.now();
            const MIN_LOADING_TIME = 1500; // 1.5 secondes minimum

            // 1. Upload des images
            const imageUrls = await uploadImages(selectedFiles);

            // 2. Créer l'annonce
            // Préparer les champs dynamiques pour l'envoi
            const dynamicFieldsData = Object.entries(dynamicFieldValues)
                .filter(([, value]) => value && value.trim() !== '')
                .map(([fieldId, value]) => ({ fieldId, value }));

            const createData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                categoryId: formData.subcategoryId || formData.categoryId,
                location: formData.location.trim(),
                images: imageUrls,
                userId: user?.id,
                dynamicFields: dynamicFieldsData,
            };

            const response = await fetch('/api/ads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la création de l\'annonce');
            }

            const result = await response.json();

            if (result.success) {
                // Calculer le temps écoulé
                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME - elapsedTime;

                // Si le processus a été trop rapide, attendre le temps restant
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                // Forcer la mise à jour du cache SWR pour que l'admin et le vendeur voient l'annonce de suite
                mutate((key) => typeof key === 'string' && key.startsWith('/api/ads'));

                setSuccess(true);

                // Afficher le message de succès pendant 2 secondes
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
                                Détails de l&apos;annonce
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



                            {/* Champs dynamiques */}
                            <DynamicFieldsInput
                                categoryId={formData.subcategoryId || formData.categoryId}
                                values={dynamicFieldValues}
                                onChange={handleDynamicFieldChange}
                                errors={dynamicFieldErrors}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Bouton Submit */}
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>
                                            {uploadingImages
                                                ? 'Téléchargement des images...'
                                                : submitting
                                                    ? 'Publication en cours...'
                                                    : 'Traitement...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span>Publier l&apos;annonce</span>
                                    </>
                                )}
                            </button>

                            {/* Message de patience pendant le traitement */}
                            {isLoading && (
                                <p className="text-center text-sm text-gray-500 mt-3 flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    Veuillez patienter, ne fermez pas cette page...
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
