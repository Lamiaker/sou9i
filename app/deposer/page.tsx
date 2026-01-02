"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import Image from "next/image";
import {
    Camera, MapPin, Tag, DollarSign, Upload, X,
    AlertCircle, CheckCircle, Loader2, Phone
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import DynamicFieldsInput from "@/components/forms/DynamicFieldsInput";
import { validateAllFields } from "@/hooks/useDynamicFields";
import { useDynamicFields } from "@/hooks/useDynamicFields";
import CategorySelect from "@/components/ui/CategorySelect";
import { getErrorMessage } from "@/lib/errors";
import { isValidPhoneNumber } from "@/lib/utils/helpers";

interface FormData {
    title: string;
    description: string;
    price: string;
    categoryId: string;
    subcategoryId: string;
    location: string;
    useProfilePhone: boolean;
    contactPhone: string;
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
        useProfilePhone: true, // Par défaut, utiliser le numéro du profil
        contactPhone: '',
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // État pour les champs dynamiques
    const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
    const [dynamicFieldErrors, setDynamicFieldErrors] = useState<Record<string, string>>({});

    // Ref pour le message d'erreur (scroll automatique)
    const errorRef = useRef<HTMLDivElement>(null);

    // Scroll automatique vers l'erreur quand elle apparaît
    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

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

        // Validation du numéro de contact
        if (!formData.useProfilePhone) {
            if (!formData.contactPhone.trim()) {
                setError('Veuillez entrer un numéro de contact');
                return;
            }
            // Validation stricte du format de téléphone algérien (05, 06, 07 + 8 chiffres)
            if (!isValidPhoneNumber(formData.contactPhone)) {
                setError('Le numéro est incorrect');
                return;
            }
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

            // Déterminer le numéro de contact à utiliser
            const contactPhone = formData.useProfilePhone
                ? null // Utiliser le numéro du profil (sera géré côté affichage)
                : formData.contactPhone.trim();

            // ✅ SÉCURITÉ: Ne pas envoyer userId - le serveur utilise la session authentifiée
            const createData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                categoryId: formData.subcategoryId || formData.categoryId,
                location: formData.location.trim(),
                contactPhone,
                images: imageUrls,
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
                // Afficher les erreurs de validation détaillées si disponibles
                if (data.details && Array.isArray(data.details)) {
                    const errorMessages = data.details.map((d: { field: string; message: string }) =>
                        `${d.field}: ${d.message}`
                    ).join('\n');
                    throw new Error(errorMessages || data.error || 'Erreur lors de la création de l\'annonce');
                }
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
                    router.push('/dashboard');
                }, 2000);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
        } catch (err) {
            console.error('Error creating ad:', err);
            // Afficher le message d'erreur original pour voir les détails de validation
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(getErrorMessage(err));
            }
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
                        <div ref={errorRef} className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="text-red-700 text-sm">
                                {error.includes('\n') ? (
                                    <ul className="list-disc list-inside space-y-1">
                                        {error.split('\n').map((line, i) => (
                                            <li key={i}>{line}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                            <div className="text-green-700 text-sm">
                                <p className="font-semibold">Annonce créée avec succès !</p>
                                <p>Redirection vers votre tableau de bord...</p>
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
                                <CategorySelect
                                    id="categoryId"
                                    label="Catégorie"
                                    required
                                    value={formData.categoryId}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }));
                                        setDynamicFieldValues({});
                                    }}
                                    options={categories.map(cat => ({
                                        id: cat.id,
                                        name: cat.name,
                                        icon: cat.icon
                                    }))}
                                    placeholder="Choisir une catégorie"
                                    disabled={isLoading}
                                    variant="category"
                                />

                                {/* Sous-catégorie */}
                                {selectedCat && selectedCat.children && selectedCat.children.length > 0 && (
                                    <CategorySelect
                                        id="subcategoryId"
                                        label="Sous-catégorie"
                                        value={formData.subcategoryId}
                                        onChange={(value) => {
                                            setFormData(prev => ({ ...prev, subcategoryId: value }));
                                        }}
                                        options={selectedCat.children.map(child => ({
                                            id: child.id,
                                            name: child.name,
                                            icon: child.icon
                                        }))}
                                        placeholder="Choisir (optionnel)"
                                        disabled={isLoading}
                                        variant="subcategory"
                                    />
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

                            {/* Section Numéro de contact */}
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <Phone className="text-primary" size={24} />
                                    Numéro de contact
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Ce numéro sera visible par les acheteurs intéressés par votre annonce.
                                </p>

                                <div className="space-y-3">
                                    {/* Option 1: Utiliser le numéro du profil */}
                                    <label
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                            ${formData.useProfilePhone
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="phoneChoice"
                                            checked={formData.useProfilePhone}
                                            onChange={() => setFormData(prev => ({ ...prev, useProfilePhone: true, contactPhone: '' }))}
                                            className="w-5 h-5 text-primary focus:ring-primary"
                                            disabled={isLoading}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">
                                                    Utiliser mon numéro d'inscription
                                                </span>
                                                {formData.useProfilePhone && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                        Recommandé
                                                    </span>
                                                )}
                                            </div>
                                            {user?.phone ? (
                                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {user.phone}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-orange-500 mt-1">
                                                    ⚠️ Aucun numéro enregistré dans votre profil
                                                </p>
                                            )}
                                        </div>
                                    </label>

                                    {/* Option 2: Utiliser un autre numéro */}
                                    <label
                                        className={`
                                            flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                            ${!formData.useProfilePhone
                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="phoneChoice"
                                            checked={!formData.useProfilePhone}
                                            onChange={() => setFormData(prev => ({ ...prev, useProfilePhone: false }))}
                                            className="w-5 h-5 text-primary focus:ring-primary mt-0.5"
                                            disabled={isLoading}
                                        />
                                        <div className="flex-1 space-y-3">
                                            <span className="font-medium text-gray-900">
                                                Utiliser un autre numéro
                                            </span>

                                            {!formData.useProfilePhone && (
                                                <div className="space-y-2 animate-fadeIn">
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                        <input
                                                            type="tel"
                                                            value={formData.contactPhone}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                                                            className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent outline-none transition ${formData.contactPhone.trim()
                                                                ? isValidPhoneNumber(formData.contactPhone)
                                                                    ? 'border-green-500 focus:ring-green-500'
                                                                    : 'border-red-400 focus:ring-red-400'
                                                                : 'border-gray-300 focus:ring-primary'
                                                                }`}
                                                            placeholder="Ex: 0555 12 34 56"
                                                            disabled={isLoading}
                                                        />
                                                        {formData.contactPhone.trim() && (
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                {isValidPhoneNumber(formData.contactPhone) ? (
                                                                    <CheckCircle className="text-green-500" size={20} />
                                                                ) : (
                                                                    <AlertCircle className="text-red-400" size={20} />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {formData.contactPhone.trim() && !isValidPhoneNumber(formData.contactPhone) && (
                                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                                            <AlertCircle size={12} />
                                                            Format requis: 05, 06 ou 07 suivi de 8 chiffres
                                                        </p>
                                                    )}
                                                    {!formData.contactPhone.trim() && (
                                                        <p className="text-xs text-gray-500">
                                                            Format algérien: 05XX XX XX XX, 06XX XX XX XX ou 07XX XX XX XX
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {/* Avertissement si pas de numéro du profil et option 1 sélectionnée */}
                                {formData.useProfilePhone && !user?.phone && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="text-orange-500 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-sm text-orange-700 font-medium">
                                                Vous n'avez pas de numéro enregistré
                                            </p>
                                            <p className="text-sm text-orange-600 mt-1">
                                                Veuillez sélectionner "Utiliser un autre numéro" et entrer votre numéro de contact.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                        <span>Publier l'annonce</span>
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
