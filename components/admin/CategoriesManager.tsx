"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Edit2,
    Trash2,
    FolderTree,
    ShoppingBag,
    Eye,
    AlertTriangle,
    Search,
    Filter
} from 'lucide-react';
import CategoryFormModal from './CategoryFormModal';
import AdminPagination from './AdminPagination';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    order: number;
    parentId: string | null;
    children?: Category[];
    _count: {
        ads: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface CategoriesManagerProps {
    initialCategories: Category[];
    pagination: Pagination;
    currentSearch?: string;
}

export default function CategoriesManager({ initialCategories, pagination, currentSearch = '' }: CategoriesManagerProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', icon: '', description: '', parentId: '' });
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [confirmDelete, setConfirmDelete] = useState<{
        show: boolean;
        categoryId: string;
        categoryName: string;
        adsCount: number;
        hasAds: boolean;
    } | null>(null);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const openCreateModal = (parentId: string = '') => {
        // We pass parentId in initialData so the Modal knows to hide the selection
        setFormData({ name: '', slug: '', icon: '', description: '', parentId });
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setFormData({
            name: category.name,
            slug: category.slug,
            icon: category.icon || '',
            description: category.description || '',
            parentId: category.parentId || ''
        });
        setEditingId(category.id);
        setShowModal(true);
    };

    const handleSave = async (data: any): Promise<boolean> => {
        setLoading(true);
        try {
            const method = editingId ? 'PATCH' : 'POST';
            const body: any = { ...data };
            if (editingId) body.categoryId = editingId;

            const res = await fetch('/api/admin/categories', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.error || 'Une erreur est survenue');
                setLoading(false);
                return false; // Retourner false pour garder le modal ouvert
            }

            toast.success(editingId ? 'Catégorie modifiée avec succès' : 'Catégorie créée avec succès');
            router.refresh();
            setLoading(false);
            return true; // Succès
        } catch (error: any) {
            console.error('Error:', error);
            toast.error('Une erreur réseau est survenue');
            setLoading(false);
            return false; // Erreur réseau
        }
    };

    // Ouvrir le modal de confirmation
    const initiateDelete = (categoryId: string, categoryName: string, adsCount: number = 0) => {
        setConfirmDelete({
            show: true,
            categoryId,
            categoryName,
            adsCount,
            hasAds: adsCount > 0
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

            // Si la catégorie a des annonces et on n'a pas forcé la suppression
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
                toast.success(`Catégorie et ${data.deletedAdsCount} annonce(s) supprimées`);
            } else {
                toast.success('Catégorie supprimée avec succès');
            }

            setConfirmDelete(null);
            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Une erreur est survenue');
            setConfirmDelete(null);
        } finally {
            setLoading(false);
        }
    };

    const renderCategory = (category: Category, depth = 0) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        return (
            <div key={category.id}>
                <div
                    className={`flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    style={{ paddingLeft: `${depth * 24 + 16}px` }}
                >
                    {/* Expand/Collapse */}
                    {/* <button
                        onClick={() => toggleExpand(category.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${hasChildren ? 'hover:bg-white/10 text-white/60' : 'text-transparent'}`}
                        disabled={!hasChildren}
                    >
                        {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </button> */}

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        {category.icon ? <span className="text-lg">{category.icon}</span> : <FolderTree className="w-5 h-5 text-cyan-400" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <Link href={`/admin/categories/${category.id}`} className="hover:text-cyan-400 transition-colors">
                            <p className="text-white font-medium">{category.name}</p>
                        </Link>
                        <p className="text-white/40 text-sm">{category.slug}</p>
                    </div>

                    {/* Ads Count */}
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-white/60 text-sm">
                        <ShoppingBag className="w-4 h-4" />
                        {category._count.ads}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <Link
                            href={`/admin/categories/${category.id}`}
                            className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                            title="Voir détails"
                        >
                            <Eye size={18} />
                        </Link>
                        <button
                            onClick={() => openCreateModal(category.id)}
                            className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                            title="Ajouter une sous-catégorie"
                        >
                            <Plus size={18} />
                        </button>
                        <button
                            onClick={() => openEditModal(category)}
                            className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <Edit2 size={18} />
                        </button>
                        <button
                            onClick={() => initiateDelete(category.id, category.name, category._count?.ads || 0)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div>
                        {category.children!.map((child) => renderCategory(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Flatten categories for parent select
    const flattenCategories = (cats: Category[], prefix = ''): { id: string; label: string }[] => {
        return cats.flatMap((cat) => [
            { id: cat.id, label: prefix + cat.name },
            ...(cat.children ? flattenCategories(cat.children, prefix + '— ') : []),
        ]);
    };

    const flatCategories = flattenCategories(categories);

    return (
        <div className="space-y-6">
            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Form */}
                <form className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={currentSearch}
                            placeholder="Rechercher une catégorie..."
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                </form>

                {/* Add Button */}
                <button
                    onClick={() => openCreateModal()}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter une catégorie
                </button>
            </div>

            {/* Categories Tree */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <FolderTree className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/60">
                            {currentSearch ? `Aucune catégorie trouvée pour "${currentSearch}"` : 'Aucune catégorie'}
                        </p>
                    </div>
                ) : (
                    <>
                        {categories.map((category) => renderCategory(category))}

                        {/* Pagination */}
                        <AdminPagination pagination={pagination} basePath="/admin/categories" />
                    </>
                )}
            </div>

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
                                    La catégorie <strong>&quot;{confirmDelete.categoryName}&quot;</strong> contient :
                                </p>
                                <p className="text-red-400 font-bold text-lg">
                                    {confirmDelete.adsCount} annonce{confirmDelete.adsCount > 1 ? 's' : ''}
                                </p>
                                <p className="text-white/60 text-sm mt-2">
                                    Si vous confirmez, toutes ces annonces seront supprimées définitivement.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-white/90">
                                    Êtes-vous sûr de vouloir supprimer la catégorie <strong>&quot;{confirmDelete.categoryName}&quot;</strong> ?
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

            {/* Modal */}
            <CategoryFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSave}
                initialData={formData as any}
                categoryTree={flatCategories}
                title={editingId ? 'Modifier la catégorie' : (formData.parentId ? 'Nouvelle sous-catégorie' : 'Nouvelle catégorie')}
                editingId={editingId}
            />
        </div>
    );
}
