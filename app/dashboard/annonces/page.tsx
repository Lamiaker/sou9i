"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Plus, Search, Edit, Trash2, Eye, Loader2,
    AlertCircle, CheckCircle, PackageX
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAds } from "@/hooks/useAds";
import { AnnoncesSkeleton } from "@/components/layout/DashboardInnerSkeletons";

export default function MesAnnoncesPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; adId: string | null }>({
        open: false,
        adId: null,
    });
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Récupérer les annonces de l&apos;utilisateur (EXCLURE les deleted automatiquement)
    const { ads, loading, error, refetch } = useAds({
        filters: {
            userId: user?.id,
            // Ne jamais montrer les annonces deleted au client
            status: statusFilter === "all"
                ? "active,pending,sold" // Tous sauf deleted
                : statusFilter,
            moderationStatus: 'ALL' // Voir toutes les annonces, même en attente/rejetées
        },
        limit: 50,
        enabled: !!user?.id && isAuthenticated,
    });

    // Redirection si non connecté
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/dashboard/annonces');
        }
    }, [authLoading, isAuthenticated, router]);

    // Loading
    if (authLoading || loading) {
        return <AnnoncesSkeleton />;
    }

    // Error
    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <div>
                    <p className="text-red-700 font-medium">Erreur de chargement</p>
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Filtrage par recherche
    const filteredAds = ads.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ad.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Soft Delete
    const handleDelete = async (adId: string) => {
        try {
            setDeleting(true);

            const response = await fetch(`/api/ads/${adId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'deleted',
                    userId: user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            setMessage({ type: 'success', text: 'Annonce supprimée avec succès' });
            setDeleteModal({ open: false, adId: null });
            refetch(); // Recharger la liste

            // Cacher le message après 3s
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({
                type: 'error',
                text: err instanceof Error ? err.message : 'Erreur lors de la suppression'
            });
        } finally {
            setDeleting(false);
        }
    };

    const getStatusDisplay = (ad: any) => {
        // Priorité au statut de modération si rejeté ou en attente
        if (ad.moderationStatus === 'REJECTED') {
            return { label: 'Refusé', color: 'bg-red-100 text-red-800', icon: AlertCircle };
        }
        if (ad.moderationStatus === 'PENDING') {
            return { label: 'En examen', color: 'bg-orange-100 text-orange-800', icon: Loader2 };
        }

        // Sinon statut commercial
        switch (ad.status) {
            case 'active':
                return { label: 'En ligne', color: 'bg-green-100 text-green-800', icon: CheckCircle };
            case 'pending': // Ancien statut pending, peut être utilisé comme draft ?
                return { label: 'Brouillon', color: 'bg-gray-100 text-gray-800', icon: Edit };
            case 'sold':
                return { label: 'Vendu', color: 'bg-blue-100 text-blue-800', icon: PackageX };
            default:
                return { label: ad.status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6 relative">
            {/* Messages */}
            {message && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${message.type === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                    ) : (
                        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                    )}
                    <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                        {message.text}
                    </p>
                </div>
            )}

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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
                >
                    <option value="all">Tous</option>
                    <option value="active">En ligne</option>
                    <option value="pending">En attente / Brouillon</option>
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
                            {filteredAds.length > 0 ? (
                                filteredAds.map((ad) => {
                                    const statusInfo = getStatusDisplay(ad);
                                    const StatusIcon = statusInfo.icon || AlertCircle;
                                    return (
                                        <tr key={ad.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                        {ad.images && ad.images.length > 0 ? (
                                                            <Image
                                                                src={ad.images[0]}
                                                                alt={ad.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                                <PackageX size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900 line-clamp-1">{ad.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                {formatPrice(ad.price)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                {formatDate(ad.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                        <StatusIcon size={12} />
                                                        {statusInfo.label}
                                                    </span>
                                                    {ad.moderationStatus === 'REJECTED' && ad.rejectionReason && (
                                                        <span className="text-xs text-red-600 max-w-[150px] truncate" title={ad.rejectionReason}>
                                                            {ad.rejectionReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Eye size={16} />
                                                    {ad.views}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/annonces/${ad.id}`}>
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                                            title="Voir"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/dashboard/annonces/${ad.id}/edit`}>
                                                        <button
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Modifier"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, adId: ad.id })}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? "Aucune annonce ne correspond à votre recherche." : "Vous n&apos;avez pas encore d&apos;annonce."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAds.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-gray-500">Affichage de {filteredAds.length} annonce{filteredAds.length > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <Trash2 className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Supprimer l&apos;annonce ?</h3>
                                    <p className="text-sm text-gray-500">Action irréversible pour vous</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer cette annonce ? Elle disparaîtra de votre liste et ne sera plus visible sur le site.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModal({ open: false, adId: null })}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                                    disabled={deleting}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => deleteModal.adId && handleDelete(deleteModal.adId)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={18} />
                                            Supprimer définitivement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
