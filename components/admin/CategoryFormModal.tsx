"use client";

import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<boolean>;
    initialData?: {
        name: string;
        slug: string;
        icon: string;
        image: string;
        description: string;
        parentId: string;
        isTrending: boolean;
        trendingOrder: number | null;
    };
    categoryTree: { id: string; label: string }[];
    title: string;
    editingId?: string | null;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
    editingId
}: CategoryFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        image: '',
        description: '',
        parentId: '',
        isTrending: false,
        trendingOrder: null as number | null
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    // État de validation du slug
    const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
    const debouncedSlug = useDebounce(formData.slug, 500);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    trendingOrder: initialData.trendingOrder ?? null
                });
            } else {
                setFormData({ name: '', slug: '', icon: '', image: '', description: '', parentId: '', isTrending: false, trendingOrder: null });
            }
            setSlugStatus('idle');
        }
    }, [isOpen, initialData]);

    // Vérifier le slug quand il change (debounced)
    const checkSlug = useCallback(async (slug: string) => {
        if (!slug || slug.length < 2) {
            setSlugStatus('idle');
            return;
        }

        // Si on édite et que le slug n'a pas changé, c'est valide
        if (editingId && initialData?.slug === slug) {
            setSlugStatus('available');
            return;
        }

        setSlugStatus('checking');

        try {
            const params = new URLSearchParams({ slug });
            if (editingId) {
                params.append('excludeId', editingId);
            }

            const res = await fetch(`/api/admin/categories/check-slug?${params.toString()}`);
            const data = await res.json();

            if (data.exists) {
                setSlugStatus('taken');
            } else {
                setSlugStatus('available');
            }
        } catch (error) {
            console.error('Slug check error:', error);
            setSlugStatus('idle');
        }
    }, [editingId, initialData?.slug]);

    useEffect(() => {
        if (debouncedSlug) {
            checkSlug(debouncedSlug);
        }
    }, [debouncedSlug, checkSlug]);

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.slug) {
            toast.warning('Nom et slug sont requis');
            return;
        }

        if (slugStatus === 'taken') {
            toast.error('Ce slug est déjà utilisé');
            return;
        }

        setLoading(true);
        try {
            const success = await onSubmit(formData);
            // Fermer le modal seulement si le save a réussi
            if (success !== false) {
                onClose();
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Rendu de l'indicateur de statut du slug
    const renderSlugStatus = () => {
        switch (slugStatus) {
            case 'checking':
                return (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                );
            case 'available':
                return (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                );
            case 'taken':
                return (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-white mb-6">{title}</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-white/60 text-sm mb-2">Nom</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({
                                ...formData,
                                name: e.target.value,
                                slug: !editingId ? generateSlug(e.target.value) : formData.slug
                            })}
                            placeholder="Mode femme"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">
                            Slug
                            {slugStatus === 'taken' && (
                                <span className="text-red-400 ml-2 text-xs">
                                    Ce slug existe déjà
                                </span>
                            )}
                            {slugStatus === 'available' && (
                                <span className="text-emerald-400 ml-2 text-xs">
                                    Disponible
                                </span>
                            )}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="mode-femme"
                                className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 transition-colors
                                    ${slugStatus === 'taken'
                                        ? 'border-red-500/50 focus:ring-red-500/50'
                                        : slugStatus === 'available'
                                            ? 'border-emerald-500/50 focus:ring-emerald-500/50'
                                            : 'border-white/10 focus:ring-cyan-500/50'
                                    }`}
                            />
                            {renderSlugStatus()}
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">Icône (emoji)</label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="👗"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-center text-2xl"
                        />
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">Image URL (pour tendances)</label>
                        <input
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                        <p className="text-white/40 text-xs mt-1">Optionnel. Si vide, utilise l&apos;image de la première annonce.</p>
                    </div>

                    <div>
                        <label className="block text-white/60 text-sm mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description optionnelle..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                        />
                    </div>

                    {/* Section Tendances */}
                    <div className="border-t border-white/10 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <label className="block text-white text-sm font-medium">Afficher dans Tendances</label>
                                <p className="text-white/40 text-xs">Cette catégorie apparaîtra sur la page d&apos;accueil</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({
                                    ...formData,
                                    isTrending: !formData.isTrending,
                                    trendingOrder: !formData.isTrending ? 1 : null
                                })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${formData.isTrending ? 'bg-cyan-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isTrending ? 'translate-x-6' : ''
                                    }`} />
                            </button>
                        </div>

                        {formData.isTrending && (
                            <div>
                                <label className="block text-white/60 text-sm mb-2">Ordre d&apos;affichage</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.trendingOrder ?? 1}
                                    onChange={(e) => setFormData({ ...formData, trendingOrder: parseInt(e.target.value) || 1 })}
                                    className="w-24 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.name || !formData.slug || slugStatus === 'taken' || slugStatus === 'checking'}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {editingId ? 'Enregistrer' : 'Créer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
