"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
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
    },
    {
        id: 2,
        title: "Appartement F3 - Alger Centre",
        price: "25,000,000 DZD",
        date: "25 Nov 2025",
        status: "En attente",
        views: 0,
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80",
    },
    {
        id: 3,
        title: "Robe de soirée rouge",
        price: "12,000 DZD",
        date: "20 Nov 2025",
        status: "Vendu",
        views: 89,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
    },
];

export default function MesAnnoncesPage() {
    const [annonces, setAnnonces] = useState(initialAnnonces);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "En ligne":
                return "bg-green-100 text-green-800";
            case "En attente":
                return "bg-yellow-100 text-yellow-800";
            case "Vendu":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
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
                            {annonces.map((annonce) => (
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
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Modifier">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simple UI) */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Affichage de 1 à 3 sur 3 annonces</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Précédent</button>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Suivant</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
