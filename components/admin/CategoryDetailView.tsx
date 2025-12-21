"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    FolderTree,
    ShoppingBag,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import CategoryFormModal from './CategoryFormModal';
import { useToast } from '@/components/ui/Toast';

interface CategoryDetailViewProps {
    category: any;
    allCategories: any[];
}

interface DeleteConfirmState {
    show: boolean;
    categoryId: string;
    categoryName: string;
    adsCount: number;
    hasAds: boolean;
    isSubcategory: boolean;
}

export default function CategoryDetailView({ category, allCategories }: CategoryDetailViewProps) {
    const router = useRouter();
    const toast = useToast();
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<DeleteConfirmState | null>(null);

    const flatCategories = allCategories.flatMap((cat: any) => [
        { id: cat.id, label: cat.name },
        ...(cat.children ? cat.children.map((c: any) => ({ id: c.id, label: `— ${c.name}` })) : [])
    ]);

    const handleSave = async (data: any): Promise<boolean> => {
        if (!editingCategory) return false;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: editingCategory.id,
                    ...data
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || 'Une erreur est survenue');
                return false;
            }

            toast.success('Catégorie modifiée avec succès');
            router.refresh();
            setEditingCategory(null);
            return true;
        } catch (error) {
            console.error('Error:', error);
            toast.error('Une erreur réseau est survenue');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Ouvrir le modal de confirmation
    const initiateDelete = (targetId: string, targetName: string, adsCount: number = 0, isSubcategory: boolean = false) => {
        setConfirmDelete({
            show: true,
            categoryId: targetId,
            categoryName: targetName,
            adsCount: adsCount,
            hasAds: adsCount > 0,
            isSubcategory
        });
    };

    // Exécuter la suppression
    const executeDelete = async (forceDelete: boolean = false) => {
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: confirmDelete.categoryId,
                    forceDelete
                }),
            });

            const data = await res.json();

            // Si la catégorie a des annonces et on n'a pas encore confirmé la suppression forcée
            if (data.requiresConfirmation && data.hasAds && !forceDelete) {
                setConfirmDelete(prev => prev ? {
                    ...prev,
                    adsCount: data.adsCount,
                    hasAds: true
                } : null);
                setLoading(false);
                return;
            }

            if (!res.ok && !data.success) {
                toast.error(data.error || 'Impossible de supprimer');
                setConfirmDelete(null);
                setLoading(false);
                return;
            }

            // Succès
            if (forceDelete && data.deletedAdsCount) {
                toast.success(`Catégorie et ${data.deletedAdsCount} annonce(s) supprimées définitivement`);
            } else {
                toast.success('Catégorie supprimée avec succès');
            }

            setConfirmDelete(null);

            // Rediriger si c'est la catégorie principale
            if (confirmDelete.categoryId === category.id) {
                router.push('/admin/categories');
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Une erreur réseau est survenue');
            setConfirmDelete(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Modal de confirmation pour suppression */}
            {confirmDelete?.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !loading && setConfirmDelete(null)}
                    />
                    <div className={`relative bg-slate-900 border ${confirmDelete.hasAds ? 'border-red-500/30' : 'border-white/10'} rounded-2xl p-6 w-full max-w-md`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-12 h-12 rounded-full ${confirmDelete.hasAds ? 'bg-red-500/20' : 'bg-amber-500/20'} flex items-center justify-center`}>
                                <AlertTriangle className={`w-6 h-6 ${confirmDelete.hasAds ? 'text-red-400' : 'text-amber-400'}`} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {confirmDelete.hasAds ? 'Attention !' : 'Confirmer la suppression'}
                                </h2>
                                <p className={`${confirmDelete.hasAds ? 'text-red-400' : 'text-amber-400'} text-sm`}>
                                    {confirmDelete.hasAds ? 'Suppression définitive' : 'Cette action est irréversible'}
                                </p>
                            </div>
                        </div>

                        {confirmDelete.hasAds ? (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                <p className="text-white/90 mb-2">
                                    La {confirmDelete.isSubcategory ? 'sous-catégorie' : 'catégorie'} <strong>&quot;{confirmDelete.categoryName}&quot;</strong> contient :
                                </p>
                                <p className="text-red-400 font-bold text-lg">
                                    {confirmDelete.adsCount} annonce{confirmDelete.adsCount > 1 ? 's' : ''}
                                </p>
                                <p className="text-white/60 text-sm mt-2">
                                    Si vous confirmez, toutes ces annonces seront supprimées définitivement et ne pourront pas être récupérées.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-white/90">
                                    Êtes-vous sûr de vouloir supprimer la {confirmDelete.isSubcategory ? 'sous-catégorie' : 'catégorie'} <strong>&quot;{confirmDelete.categoryName}&quot;</strong> ?
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => executeDelete(confirmDelete.hasAds)}
                                disabled={loading}
                                className={`flex-1 px-4 py-3 ${confirmDelete.hasAds ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'} text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        {confirmDelete.hasAds ? 'Supprimer tout' : 'Supprimer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/categories"
                    className="p-2 bg-white/5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        {category.icon && <span>{category.icon}</span>}
                        {category.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-white/40 mt-1">
                        <span>slug: {category.slug}</span>
                        {category.parent && (
                            <>
                                <span>•</span>
                                <span>Parent: {category.parent.name}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="ml-auto flex gap-2">
                    <button
                        onClick={() => setEditingCategory(category)}
                        disabled={loading}
                        className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Edit2 size={18} />
                        Modifier
                    </button>
                    <button
                        onClick={() => initiateDelete(category.id, category.name, category._count?.ads || 0, false)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 size={18} />
                        Supprimer
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">À propos</h3>
                        <p className="text-white/60">
                            {category.description || 'Aucune description fournie.'}
                        </p>
                    </div>

                    {/* Subcategories */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                <FolderTree className="w-5 h-5 text-teal-400" />
                                Sous-catégories
                                <span className="text-sm bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                                    {category.children.length}
                                </span>
                            </h3>
                        </div>

                        {category.children.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {category.children.map((child: any) => (
                                    <div key={child.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                                                {child.icon || <FolderTree size={16} />}
                                            </div>
                                            <div>
                                                <Link href={`/admin/categories/${child.id}`} className="text-white font-medium hover:underline">
                                                    {child.name}
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/40 text-sm">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg">
                                                <ShoppingBag size={14} />
                                                {child._count?.ads || 0}
                                            </div>
                                            <button
                                                onClick={() => setEditingCategory(child)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors disabled:opacity-50"
                                                title="Modifier sous-catégorie"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => initiateDelete(child.id, child.name, child._count?.ads || 0, true)}
                                                disabled={loading}
                                                className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors disabled:opacity-50"
                                                title="Supprimer sous-catégorie"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-white/40">
                                Aucune sous-catégorie
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 rounded-2xl p-6">
                        <h3 className="text-lg font-medium text-white mb-4">Statistiques</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-white/80">
                                <span className="flex items-center gap-2">
                                    <ShoppingBag size={16} className="text-cyan-400" />
                                    Total Annonces
                                </span>
                                <span className="font-bold text-xl">{category.totalAds}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <CategoryFormModal
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                onSubmit={handleSave}
                initialData={editingCategory ? {
                    name: editingCategory.name,
                    slug: editingCategory.slug,
                    icon: editingCategory.icon || '',
                    description: editingCategory.description || '',
                    parentId: editingCategory.parentId || ''
                } : undefined}
                categoryTree={flatCategories}
                title={`Modifier: ${editingCategory?.name}`}
                editingId={editingCategory?.id}
            />
        </div>
    );
}
