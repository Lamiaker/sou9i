"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import Image from "next/image";
import {
    Camera, MapPin, Tag, DollarSign, Upload, X,
    AlertCircle, CheckCircle, Loader2, Phone
} from "lucide-react";
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

interface DeposerAdFormProps {
    initialCategories: any[];
}

export default function DeposerAdForm({ initialCategories }: DeposerAdFormProps) {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { uploadImages, uploading: uploadingImages } = useImageUpload();

    // États du formulaire
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        categoryId: '',
        subcategoryId: '',
        location: '',
        useProfilePhone: true,
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

    const errorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [error]);

    const effectiveCategoryId = formData.subcategoryId || formData.categoryId;
    const { fields: dynamicFields } = useDynamicFields(effectiveCategoryId);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDynamicFieldChange = (fieldId: string, value: string) => {
        setDynamicFieldValues(prev => ({ ...prev, [fieldId]: value }));
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

        const totalFiles = selectedFiles.length + validFiles.length;
        if (totalFiles > 5) {
            alert('Maximum 5 images autorisées');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);

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

        if (!isCategorySelected) {
            setError(hasSubcategories ? 'Veuillez sélectionner une sous-catégorie' : 'Veuillez sélectionner une catégorie');
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

        if (!formData.useProfilePhone) {
            if (!formData.contactPhone.trim()) {
                setError('Veuillez entrer un numéro de contact');
                return;
            }
            if (!isValidPhoneNumber(formData.contactPhone)) {
                setError('Le numéro est incorrect');
                return;
            }
        }

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
            const startTime = Date.now();
            const MIN_LOADING_TIME = 1500;

            const imageUrls = await uploadImages(selectedFiles);

            const dynamicFieldsData = Object.entries(dynamicFieldValues)
                .filter(([, value]) => value && value.trim() !== '')
                .map(([fieldId, value]) => ({ fieldId, value }));

            const contactPhone = formData.useProfilePhone
                ? null
                : formData.contactPhone.trim();

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
                if (data.details && Array.isArray(data.details)) {
                    const errorMessages = data.details.map((d: any) =>
                        `${d.field}: ${d.message}`
                    ).join('\n');
                    throw new Error(errorMessages || data.error || 'Erreur lors de la création de l\'annonce');
                }
                throw new Error(data.error || 'Erreur lors de la création de l\'annonce');
            }

            const result = await response.json();

            if (result.success) {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME - elapsedTime;

                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime));
                }

                mutate((key) => typeof key === 'string' && key.startsWith('/api/ads'));

                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
        } catch (err) {
            console.error('Error creating ad:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(getErrorMessage(err));
            }
        } finally {
            setSubmitting(false);
        }
    };

    const selectedCat = initialCategories.find(cat => cat.id === formData.categoryId);
    const hasSubcategories = selectedCat?.children && selectedCat.children.length > 0;
    const isCategorySelected = formData.categoryId && (!hasSubcategories || formData.subcategoryId);
    const isLoading = submitting || uploadingImages;

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-gradient-to-r from-primary to-secondary px-6 py-8 text-white">
                        <h1 className="text-3xl font-bold">Déposer une annonce</h1>
                        <p className="mt-2 text-orange-100">
                            Bonjour {user?.name || 'utilisateur'}, vendez vos articles en quelques clics.
                        </p>
                    </div>

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

                    <form className="p-6 sm:p-8 space-y-8 overflow-visible" onSubmit={handleSubmit}>
                        <div className={`space-y-6 overflow-visible ${!isCategorySelected ? 'min-h-[500px] pb-8' : ''}`}>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Tag className="text-primary" size={24} />
                                Choisir une catégorie
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CategorySelect
                                    id="categoryId"
                                    label="Catégorie"
                                    required
                                    value={formData.categoryId}
                                    onChange={(value) => {
                                        setFormData(prev => ({ ...prev, categoryId: value, subcategoryId: '' }));
                                        setDynamicFieldValues({});
                                        setError(null);
                                    }}
                                    options={initialCategories.map(cat => ({
                                        id: cat.id,
                                        name: cat.name,
                                        icon: cat.icon
                                    }))}
                                    placeholder="Choisir une catégorie"
                                    disabled={isLoading}
                                    variant="category"
                                />

                                {selectedCat && selectedCat.children && selectedCat.children.length > 0 && (
                                    <CategorySelect
                                        id="subcategoryId"
                                        label="Sous-catégorie"
                                        value={formData.subcategoryId}
                                        onChange={(value) => {
                                            setFormData(prev => ({ ...prev, subcategoryId: value }));
                                            setDynamicFieldValues({});
                                            setError(null);
                                        }}
                                        options={selectedCat.children.map((child: any) => ({
                                            id: child.id,
                                            name: child.name,
                                            icon: child.icon
                                        }))}
                                        placeholder="Choisir une sous-catégorie"
                                        disabled={isLoading}
                                        variant="subcategory"
                                    />
                                )}
                            </div>

                            {!isCategorySelected && (
                                <p className="text-sm text-gray-500 italic flex items-center gap-2">
                                    <AlertCircle size={16} className="text-primary/50" />
                                    {!formData.categoryId
                                        ? "Sélectionnez d'abord une catégorie pour continuer"
                                        : "Veuillez choisir une sous-catégorie"}
                                </p>
                            )}
                        </div>

                        {isCategorySelected && (
                            <>
                                <div className="space-y-4 pt-6 border-t border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Camera className="text-primary" size={24} />
                                        Photos (1-5)
                                    </h2>

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

                                <div className="space-y-6 pt-6 border-t border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Tag className="text-primary" size={24} />
                                        Détails de l'annonce
                                    </h2>

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

                                    <DynamicFieldsInput
                                        categoryId={formData.subcategoryId || formData.categoryId}
                                        values={dynamicFieldValues}
                                        onChange={handleDynamicFieldChange}
                                        errors={dynamicFieldErrors}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <Phone className="text-primary" size={24} />
                                        Numéro de contact
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Ce numéro sera visible par les acheteurs intéressés par votre annonce.
                                    </p>

                                    <div className="space-y-3">
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
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={isLoading || !isCategorySelected}
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
