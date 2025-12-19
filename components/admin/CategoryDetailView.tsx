"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Edit2,
    Trash2,
    FolderTree,
    ShoppingBag} from 'lucide-react';
import Link from 'next/link';
import CategoryFormModal from './CategoryFormModal';

interface CategoryDetailViewProps {
    category: any;
    allCategories: any[];
}

export default function CategoryDetailView({ category, allCategories }: CategoryDetailViewProps) {
    const router = useRouter();
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    // Removed unused loading state

    const flatCategories = allCategories.flatMap((cat: any) => [
        { id: cat.id, label: cat.name },
        ...(cat.children ? cat.children.map((c: any) => ({ id: c.id, label: `— ${c.name}` })) : [])
    ]); // Simple 1-level flatten for now, consistent with Manager

    const handleSave = async (data: any) => {
        if (!editingCategory) return;

        // setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: editingCategory.id,
                    ...data
                }),
            });

            if (!res.ok) throw new Error('Failed to update');

            router.refresh();
            setEditingCategory(null);
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        } finally {
            // setLoading(false);
        }
    };

    const handleDelete = async (targetId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        // setLoading(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryId: targetId }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Impossible de supprimer');
                return;
            }

            if (targetId === category.id) {
                router.push('/admin/categories'); // Redirect to list if current category is deleted
            } else {
                router.refresh(); // Refresh if a subcategory is deleted
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        } finally {
            // setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
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
                        className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors flex items-center gap-2"
                    >
                        <Edit2 size={18} />
                        Modifier
                    </button>
                    <button
                        onClick={() => handleDelete(category.id)}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
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
                                        <div className="flex items-center gap-4 text-white/40 text-sm">
                                            <div className="flex items-center gap-1">
                                                <ShoppingBag size={14} />
                                                {child._count.ads}
                                            </div>
                                            <button
                                                onClick={() => setEditingCategory(child)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 transition-colors"
                                                title="Modifier sous-catégorie"
                                            >
                                                <Edit2 size={16} />
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
                            {/* Potential future stat: Verification percentage, etc. */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal (Generic for both Parent and Child) */}
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

            {/* Create Modal (For Subcategories) needs separate state or reuse logic, 
                but simpler to just add 'Create Subcategory' button in header if needed.
                However, user didn't explicitly ask for 'Create Subcategory' here, but it's good UX.
                Let's stick to what is there for now to avoid overcomplicating unless user asks.
            */}
        </div>
    );
}
