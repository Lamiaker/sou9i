"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Camera, MapPin, Upload, X,
    AlertCircle, CheckCircle, Loader2, ArrowLeft, Save, DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAd } from "@/hooks/useAds";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FormData {
    title: string;
    description: string;
    price: string;
    location: string;
    status: string;
}

export default function EditAnnoncePage() {
    const router = useRouter();
    const params = useParams();
    const adId = params.id as string;

    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { ad, loading: adLoading, error: adError } = useAd(adId);
    const { uploadImages, uploading: uploadingImages } = useImageUpload();

    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        location: '',
        status: 'active',
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Charger les données de l'annonce
    useEffect(() => {
        if (ad) {
            // Vérifier que l'utilisateur est bien le propriétaire
            if (ad.userId !== user?.id) {
                router.push('/dashboard/annonces');
                return;
            }

            setFormData({
                title: ad.title,
                description: ad.description,
                price: ad.price.toString(),
                location: ad.location,
                status: ad.status,
            });
            setExistingImages(ad.images || []);
        }
    }, [ad, user, router]);

    // Redirection si non connecté
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/dashboard/annonces');
        }
    }, [authLoading, isAuthenticated, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newFilesArray = Array.from(files);
        const validFiles = newFilesArray.filter(file => file.type.startsWith('image/'));

        if (validFiles.length !== newFilesArray.length) {
            alert('Seules les images sont acceptées');
        }

        const totalImages = existingImages.length + newFiles.length + validFiles.length;
        if (totalImages > 5) {
            alert('Maximum 5 images autorisées');
            return;
        }

        setNewFiles(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
        setNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
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

        if (!formData.location.trim()) {
            setError('La localisation est requise');
            return;
        }

        const totalImages = existingImages.length + newFiles.length;
        if (totalImages === 0) {
            setError('Veuillez avoir au moins une image');
            return;
        }

        try {
            setSubmitting(true);

            // Temps minimum pour garantir une bonne UX (utilisateur voit le feedback)
            const startTime = Date.now();
            const MIN_LOADING_TIME = 1500; // 1.5 secondes minimum

            let allImageUrls = [...existingImages];

            // Upload des nouvelles images
            if (newFiles.length > 0) {
                const newImageUrls = await uploadImages(newFiles);
                allImageUrls = [...allImageUrls, ...newImageUrls];
            }

            // Mise à jour de l'annonce (SEULEMENT les champs modifiables)
            const updateData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                location: formData.location.trim(),
                images: allImageUrls,
                status: formData.status,
                userId: user?.id,
            };

            const response = await fetch(`/api/ads/${adId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la mise à jour');
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

                setSuccess(true);

                // Redirection après 2 secondes
                setTimeout(() => {
                    router.push('/dashboard/annonces');
                }, 2000);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
        } catch (err) {
            console.error('Error updating ad:', err);
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setSubmitting(false);
        }
    };

    const isLoading = authLoading || adLoading || submitting || uploadingImages;
    const totalImages = existingImages.length + newFiles.length;

    // Loading
    if (authLoading || adLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    // Error loading ad
    if (adError || !ad) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <div>
                    <p className="text-red-700 font-medium">Annonce non trouvée</p>
                    <Link href="/dashboard/annonces" className="text-sm text-primary hover:underline">
                        Retour à mes annonces
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/annonces">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <ArrowLeft size={24} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Modifier l'annonce</h1>
                    <p className="text-gray-500">Titre, images, prix, description, localisation et statut</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                            <p className="font-semibold">Annonce mise à jour avec succès !</p>
                            <p>Redirection en cours...</p>
                        </div>
                    </div>
                )}

                <form className="p-6 sm:p-8 space-y-8" onSubmit={handleSubmit}>

                    {/* Images */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Camera className="text-primary" size={24} />
                            Photos ({totalImages}/5)
                        </h2>

                        {/* Images existantes + nouvelles */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {existingImages.map((url, index) => (
                                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                    <Image
                                        src={url}
                                        alt={`Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                    {index === 0 && (
                                        <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                                            Principale
                                        </div>
                                    )}
                                </div>
                            ))}

                            {newPreviewUrls.map((url, index) => (
                                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary">
                                    <Image
                                        src={url}
                                        alt={`Nouvelle image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        Nouvelle
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Upload */}
                        {totalImages < 5 && (
                            <label className="block">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary cursor-pointer transition">
                                    <Upload className="mx-auto text-gray-400 mb-2" size={48} />
                                    <p className="text-sm text-gray-600">
                                        Ajouter des images
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Maximum {5 - totalImages} image{5 - totalImages > 1 ? 's' : ''} restante{5 - totalImages > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewImageSelect}
                                    disabled={isLoading}
                                />
                            </label>
                        )}
                    </div>

                    {/* Détails */}
                    <div className="space-y-6">
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

                        {/* Statut */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Statut de l'annonce
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition bg-white"
                                disabled={isLoading}
                            >
                                <option value="active">En ligne</option>
                                <option value="sold">Vendu</option>
                            </select>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex gap-3">
                            <Link href="/dashboard/annonces" className="flex-1">
                                <button
                                    type="button"
                                    className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>
                                            {uploadingImages
                                                ? 'Téléchargement des images...'
                                                : submitting
                                                    ? 'Mise à jour en cours...'
                                                    : 'Traitement...'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={24} />
                                        <span>Enregistrer les modifications</span>
                                    </>
                                )}
                            </button>
                        </div>

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
    );
}
