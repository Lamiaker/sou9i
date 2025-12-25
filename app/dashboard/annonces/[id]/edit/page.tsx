"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
    Camera, MapPin, Upload, X,
    AlertCircle, CheckCircle, Loader2, ArrowLeft, Save, DollarSign,
    LayoutDashboard, FileText, Tag, Map, Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAd } from "@/hooks/useAds";
import { useImageUpload } from "@/hooks/useImageUpload";
import SimpleSelect from "@/components/ui/SimpleSelect";

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
    const adId = params?.id as string;

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100/50 backdrop-blur-sm">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Chargement de votre annonce...</p>
                </div>
            </div>
        );
    }

    // Error loading ad
    if (adError || !ad) {
        return (
            <div className="max-w-xl mx-auto mt-20 px-4">
                <div className="bg-white border text-center border-red-100 rounded-2xl p-8 shadow-lg shadow-red-500/5">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Annonce introuvable</h3>
                    <p className="text-gray-500 mb-6">L&apos;annonce que vous tentez de modifier n&apos;existe pas ou ne vous appartient pas.</p>
                    <Link href="/dashboard/annonces">
                        <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-all shadow-md hover:shadow-lg">
                            Retour à mes annonces
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Top Bar Navigation */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mb-8">
                <button
                    onClick={() => router.push('/dashboard/annonces')}
                    className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
                >
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-400">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="font-medium">Retour aux annonces</span>
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modifier l&apos;annonce</h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 font-medium text-gray-600">
                                <LayoutDashboard size={14} />
                                Référence: #{adId.slice(-6).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${formData.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {formData.status === 'active' ? '● En ligne' : '● Archivée/Vendue'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Colonne Gauche - Médias (4 colonnes sur 12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                                <ImageIcon className="text-primary" size={20} />
                                Photos de l&apos;annonce
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Images existantes */}
                                    {existingImages.map((url, index) => (
                                        <div key={`existing-${index}`} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                            <Image
                                                src={url}
                                                alt={`Image ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(index)}
                                                    className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md">
                                                    PRINCIPALE
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Nouvelles images */}
                                    {newPreviewUrls.map((url, index) => (
                                        <div key={`new-${index}`} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-primary/20 bg-primary/5">
                                            <Image
                                                src={url}
                                                alt={`Nouvelle image ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(index)}
                                                    className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white transition shadow-sm"
                                                    title="Supprimer"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500 shadow-sm ring-2 ring-white"></div>
                                        </div>
                                    ))}

                                    {/* Bouton Upload */}
                                    {totalImages < 5 && (
                                        <label className="relative flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                <Upload size={20} className="text-gray-400 group-hover:text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500 group-hover:text-primary">Ajouter photo</span>
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
                                <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                                    <span>Format JPG, PNG</span>
                                    <span>{totalImages}/5 photos</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Tag className="text-primary" size={20} />
                                Statut
                            </h2>
                            <SimpleSelect
                                value={formData.status}
                                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                options={[
                                    { value: "active", label: "En ligne (Visible)" },
                                    { value: "sold", label: "Marquer comme Vendu" },
                                ]}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                Marquez l&apos;annonce comme &quot;Vendu&quot; si l&apos;article n&apos;est plus disponible. Cela le masquera des résultats de recherche.
                            </p>
                        </div>
                    </div>

                    {/* Colonne Droite - Formulaire (8 colonnes sur 12) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-8 relative overflow-hidden">
                            {/* Décoration d'arrière-plan */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0 pointer-events-none"></div>

                            {/* Messages d'alerte */}
                            {error && (
                                <div className="animate-pulse bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                                    <AlertCircle size={20} />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-700">
                                    <CheckCircle size={20} />
                                    <div>
                                        <p className="font-bold">Annonce mise à jour !</p>
                                        <p className="text-sm">Redirection en cours...</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-8 relative z-10">
                                {/* Titre */}
                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        Titre de l&apos;annonce
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400 font-medium"
                                        placeholder="Ce que vous vendez..."
                                        disabled={isLoading}
                                        required
                                    />
                                </div>

                                {/* Prix & Localisation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="price" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <DollarSign size={16} className="text-gray-400" />
                                            Prix (DZD)
                                        </label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                id="price"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-mono font-medium"
                                                placeholder="0"
                                                disabled={isLoading}
                                                required
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm bg-gray-100 px-2 py-0.5 rounded">DZD</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="location" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <Map size={16} className="text-gray-400" />
                                            Localisation
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                                placeholder="Ville ou région"
                                                disabled={isLoading}
                                                required
                                            />
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-serif">T</div>
                                        Description détaillée
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={6}
                                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none placeholder:text-gray-400 leading-relaxed"
                                        placeholder="Dites-en plus sur votre article : état, raison de la vente, caractéristiques..."
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 mt-4 border-t border-gray-100 flex items-center gap-4">
                                <Link href="/dashboard/annonces" className="hidden sm:block">
                                    <button
                                        type="button"
                                        className="px-6 py-3.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition focus:ring-4 focus:ring-gray-100"
                                        disabled={isLoading}
                                    >
                                        Annuler
                                    </button>
                                </Link>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-gray-900 text-white font-bold py-4 px-6 rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>
                                                {uploadingImages ? 'Upload des photos...' : submitting ? 'Sauvegarde...' : 'Traitement...'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                                            <span>Enregistrer les modifications</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
