"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronRight,
    ChevronDown,
    Plus,
    Edit2,
    Trash2,
    FolderTree,
    ShoppingBag,
    X,
    Save,
    Eye
} from 'lucide-react';
import CategoryFormModal from './CategoryFormModal';
import Link from 'next/link';

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

interface CategoriesManagerProps {
    initialCategories: Category[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', slug: '', icon: '', description: '', parentId: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

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

    const handleSave = async (data: any) => {
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

            if (!res.ok) throw new Error('Failed to save');

            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
            throw error; // Re-throw to keep modal open if needed, or handle here
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Impossible de supprimer');
                return;
            }

            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
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
                            onClick={() => handleDelete(category.id)}
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
            {/* Add Button */}
            <button
                onClick={() => openCreateModal()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Ajouter une catégorie
            </button>

            {/* Categories Tree */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {categories.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <FolderTree className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/60">Aucune catégorie</p>
                    </div>
                ) : (
                    categories.map((category) => renderCategory(category))
                )}
            </div>

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
