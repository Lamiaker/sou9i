"use client";

import { useState } from 'react';
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
    Save
} from 'lucide-react';

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
    const [editForm, setEditForm] = useState({ name: '', slug: '', icon: '', description: '' });
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', slug: '', icon: '', description: '', parentId: '' });
    const [loading, setLoading] = useState(false);

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const startEdit = (category: Category) => {
        setEditingId(category.id);
        setEditForm({
            name: category.name,
            slug: category.slug,
            icon: category.icon || '',
            description: category.description || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', slug: '', icon: '', description: '' });
    };

    const handleEdit = async (categoryId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId,
                    ...editForm,
                }),
            });

            if (!res.ok) throw new Error('Failed to update');

            router.refresh();
            cancelEdit();
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!addForm.name || !addForm.slug) {
            alert('Nom et slug sont requis');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: addForm.name,
                    slug: addForm.slug,
                    icon: addForm.icon || null,
                    description: addForm.description || null,
                    parentId: addForm.parentId || null,
                }),
            });

            if (!res.ok) throw new Error('Failed to create');

            router.refresh();
            setShowAddModal(false);
            setAddForm({ name: '', slug: '', icon: '', description: '', parentId: '' });
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
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
        const isEditing = editingId === category.id;

        return (
            <div key={category.id}>
                <div
                    className={`flex items-center gap-3 p-4 hover:bg-white/5 transition-colors border-b border-white/5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    style={{ paddingLeft: `${depth * 24 + 16}px` }}
                >
                    {/* Expand/Collapse */}
                    <button
                        onClick={() => toggleExpand(category.id)}
                        className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${hasChildren ? 'hover:bg-white/10 text-white/60' : 'text-transparent'
                            }`}
                        disabled={!hasChildren}
                    >
                        {hasChildren && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                    </button>

                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                        {category.icon ? (
                            <span className="text-lg">{category.icon}</span>
                        ) : (
                            <FolderTree className="w-5 h-5 text-cyan-400" />
                        )}
                    </div>

                    {/* Content */}
                    {isEditing ? (
                        <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Nom"
                                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                            <input
                                type="text"
                                value={editForm.slug}
                                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                placeholder="Slug"
                                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            />
                            <input
                                type="text"
                                value={editForm.icon}
                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                placeholder="Icône (emoji)"
                                className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-center"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{category.name}</p>
                            <p className="text-white/40 text-sm">{category.slug}</p>
                        </div>
                    )}

                    {/* Ads Count */}
                    <div className="flex items-center gap-1 px-3 py-1 bg-white/5 rounded-full text-white/60 text-sm">
                        <ShoppingBag className="w-4 h-4" />
                        {category._count.ads}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => handleEdit(category.id)}
                                    className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                >
                                    <Save size={18} />
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => startEdit(category)}
                                    className="p-2 text-white/60 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </>
                        )}
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
                onClick={() => setShowAddModal(true)}
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

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    />
                    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-6">Nouvelle catégorie</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-white/60 text-sm mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({
                                        ...addForm,
                                        name: e.target.value,
                                        slug: generateSlug(e.target.value)
                                    })}
                                    placeholder="Mode femme"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-white/60 text-sm mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={addForm.slug}
                                    onChange={(e) => setAddForm({ ...addForm, slug: e.target.value })}
                                    placeholder="mode-femme"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-white/60 text-sm mb-2">Icône (emoji)</label>
                                <input
                                    type="text"
                                    value={addForm.icon}
                                    onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                                    placeholder="👗"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-center text-2xl"
                                />
                            </div>

                            <div>
                                <label className="block text-white/60 text-sm mb-2">Catégorie parente</label>
                                <select
                                    value={addForm.parentId}
                                    onChange={(e) => setAddForm({ ...addForm, parentId: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-800">Aucune (catégorie principale)</option>
                                    {flatCategories.map((cat) => (
                                        <option key={cat.id} value={cat.id} className="bg-slate-800">
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/60 text-sm mb-2">Description</label>
                                <textarea
                                    value={addForm.description}
                                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                    placeholder="Description optionnelle..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={loading || !addForm.name || !addForm.slug}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Créer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
