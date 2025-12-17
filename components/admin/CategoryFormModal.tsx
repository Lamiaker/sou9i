"use client";

import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: {
        name: string;
        slug: string;
        icon: string;
        description: string;
        parentId: string;
    };
    categoryTree: { id: string; label: string }[];
    title: string;
    editingId?: string | null;
}

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    categoryTree,
    title,
    editingId
}: CategoryFormModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        icon: '',
        description: '',
        parentId: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                setFormData({ name: '', slug: '', icon: '', description: '', parentId: '' });
            }
        }
    }, [isOpen, initialData]);

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
            alert('Nom et slug sont requis');
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setLoading(false);
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
                        <label className="block text-white/60 text-sm mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="mode-femme"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
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

                    {/* Parent Category field removed as per user request. 
                        Hierarchy is determined by the action context (Create Root or Add Sub) 
                        and cannot be changed in the form. 
                    */}

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
                        disabled={loading || !formData.name || !formData.slug}
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
