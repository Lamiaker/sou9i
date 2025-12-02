"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, X, Save, AlertTriangle } from "lucide-react";
import Image from "next/image";

// Mock data
const initialAnnonces = [
    {
        id: 1,
        title: "iPhone 14 Pro Max - 256GB",
        price: "180,000 DZD",
        date: "27 Nov 2025",
        status: "En ligne",
        views: 145,
        image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=300&q=80",
        description: "iPhone 14 Pro Max en excellent état, batterie 95%.",
        category: "Téléphones"
    },
    {
        id: 2,
        title: "Appartement F3 - Alger Centre",
        price: "25,000,000 DZD",
        date: "25 Nov 2025",
        status: "En attente",
        views: 0,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80",
        description: "Bel appartement F3 refait à neuf, vue sur mer.",
        category: "Immobilier"
    },
    {
        id: 3,
        title: "Robe de soirée rouge",
        price: "12,000 DZD",
        date: "20 Nov 2025",
        status: "Vendu",
        views: 89,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
        description: "Portée une seule fois, taille 38.",
        category: "Vêtements"
    },
];

export default function MesAnnoncesPage() {
    const [annonces, setAnnonces] = useState(initialAnnonces);
    const [editingAd, setEditingAd] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Suppression
    const handleDelete = (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.")) {
            setAnnonces(annonces.filter(a => a.id !== id));
        }
    };

    // Ouverture de la modale d'édition
    const handleEditClick = (ad: any) => {
        setEditingAd({ ...ad }); // Copie pour éviter la mutation directe
        setIsEditModalOpen(true);
    };

    // Sauvegarde de l'édition
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        setAnnonces(annonces.map(a => a.id === editingAd.id ? editingAd : a));
        setIsEditModalOpen(false);
        setEditingAd(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "En ligne": return "bg-green-100 text-green-800";
            case "En attente": return "bg-yellow-100 text-yellow-800";
            case "Vendu": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
                    <p className="text-gray-500">Gérez vos annonces en ligne et suivez leurs performances.</p>
                </div>
                <Link href="/deposer">
                    <button className="bg-primary hover:bg-secondary text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition shadow-sm">
                        <Plus size={20} />
                        Déposer une annonce
                    </button>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher une annonce..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    />
                </div>
                <select className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                    <option value="all">Tous les statuts</option>
                    <option value="online">En ligne</option>
                    <option value="pending">En attente</option>
                    <option value="sold">Vendu</option>
                </select>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Annonce</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vues</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {annonces.length > 0 ? (
                                annonces.map((annonce) => (
                                    <tr key={annonce.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                    <Image
                                                        src={annonce.image}
                                                        alt={annonce.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <span className="font-medium text-gray-900 line-clamp-1">{annonce.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{annonce.price}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{annonce.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(annonce.status)}`}>
                                                {annonce.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye size={16} />
                                                {annonce.views}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditClick(annonce)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(annonce.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Aucune annonce trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {annonces.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Affichage de {annonces.length} annonces</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Précédent</button>
                            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Suivant</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingAd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">Modifier l'annonce</h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                <input
                                    type="text"
                                    value={editingAd.title}
                                    onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
                                    <input
                                        type="text"
                                        value={editingAd.price}
                                        onChange={(e) => setEditingAd({ ...editingAd, price: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                    <select
                                        value={editingAd.status}
                                        onChange={(e) => setEditingAd({ ...editingAd, status: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="En ligne">En ligne</option>
                                        <option value="En attente">En attente</option>
                                        <option value="Vendu">Vendu</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={editingAd.description || ""}
                                    onChange={(e) => setEditingAd({ ...editingAd, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                    placeholder="Description de l'annonce..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-secondary text-white font-medium rounded-lg transition flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
