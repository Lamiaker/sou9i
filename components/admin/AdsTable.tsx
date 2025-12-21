"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import {
    MoreVertical,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Eye,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Archive,
    ExternalLink,
    User,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface Ad {
    id: string;
    title: string;
    price: number;
    status: string; // active, sold, archived
    moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason: string | null;
    location: string;
    views: number;
    images: string[];
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
        verificationStatus: string; // TRUSTED, VERIFIED, PENDING...
    };
    category: {
        id: string;
        name: string;
        slug: string;
    };
    _count: {
        reports: number;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface AdsTableProps {
    ads: Ad[];
    pagination: Pagination;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    sold: { label: 'Vendue', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle },
    archived: { label: 'Archivée', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Archive },
    deleted: { label: 'Supprimée', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Trash2 },
};

const moderationConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertCircle },
    APPROVED: { label: 'Validée', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: ShieldCheck },
    REJECTED: { label: 'Rejetée', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

export default function AdsTable({ ads, pagination }: AdsTableProps) {
    const router = useRouter();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (activeDropdown && !target.closest('.ad-menu-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    const handleAction = async (action: string, adId: string, extraData: any = {}) => {
        // Validation : Empêcher l&apos;approbation si l&apos;utilisateur n&apos;est pas vérifié
        if (action === 'approve') {
            const ad = ads.find(a => a.id === adId);
            if (ad) {
                const userStatus = ad.user.verificationStatus;
                if (userStatus !== 'VERIFIED' && userStatus !== 'TRUSTED') {
                    alert("⚠️ Impossible de valider l&apos;annonce.\n\nLe compte de l&apos;utilisateur est en attente ou rejeté.\nVeuillez d&apos;abord valider le compte de l&apos;utilisateur dans la section 'Utilisateurs' avant de pouvoir approuver ses annonces.");
                    return;
                }
            }
        }

        setLoading(adId);
        setActiveDropdown(null);

        try {
            // Pour updateStatus, on passe status directement. Pour autres, on passe dans extraData
            const body = action === 'updateStatus'
                ? { action, adId, status: extraData }
                : { action, adId, ...extraData };

            const res = await fetch('/api/admin/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Action failed');
            }

            // Notification simple
            // alert(data.message);
            mutate((key) => typeof key === 'string' && (key.startsWith('/api/ads') || key.startsWith('/api/admin/ads')));
            router.refresh();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Une erreur est survenue');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = (adId: string) => {
        const reason = prompt("Raison du rejet de l&apos;annonce :");
        if (reason) {
            handleAction('reject', adId, { reason });
        }
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.push(`/admin/ads?${params.toString()}`);
    };

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-visible">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-visible">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Annonce</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Vendeur</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Prix</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Validation</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Statut</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Date</th>
                            <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.map((ad) => {
                            const statusInfo = statusConfig[ad.status] || statusConfig.active;
                            const moderationInfo = moderationConfig[ad.moderationStatus] || moderationConfig.PENDING;
                            const StatusIcon = statusInfo.icon;
                            const ModIcon = moderationInfo.icon;

                            return (
                                <tr
                                    key={ad.id}
                                    className={`hover:bg-white/5 transition-colors ${loading === ad.id ? 'opacity-50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden">
                                                {ad.images[0] ? (
                                                    <Image src={ad.images[0]} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                                        <Eye className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-medium truncate max-w-[200px]">
                                                    {ad.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-white/40 text-xs px-2 py-0.5 bg-white/10 rounded-full">
                                                        {ad.category.name}
                                                    </span>
                                                    {ad._count.reports > 0 && (
                                                        <span className="text-red-400 text-xs px-2 py-0.5 bg-red-500/20 rounded-full flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {ad._count.reports}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                                <Image
                                                    src={ad.user.avatar || "/user.png"}
                                                    alt=""
                                                    width={32}
                                                    height={32}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div>
                                                <p className="text-white text-sm">{ad.user.name || 'Utilisateur'}</p>
                                                {ad.user.verificationStatus === 'TRUSTED' && (
                                                    <span className="text-[10px] text-emerald-400 font-medium">TRUSTED</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-emerald-400 font-semibold">
                                            {ad.price.toLocaleString('fr-FR')} DA
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${moderationInfo.color}`}>
                                            <ModIcon className="w-3 h-3" />
                                            {moderationInfo.label}
                                        </span>
                                        {ad.moderationStatus === 'REJECTED' && ad.rejectionReason && (
                                            <div className="text-xs text-red-400 mt-1 max-w-[150px] truncate" title={ad.rejectionReason}>
                                                {ad.rejectionReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/40 text-sm">
                                        {formatDistanceToNow(new Date(ad.createdAt), {
                                            addSuffix: true,
                                            locale: fr
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative flex items-center justify-end gap-2 ad-menu-container">
                                            <Link
                                                href={`/annonces/${ad.id}`}
                                                target="_blank"
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4 text-white/60" />
                                            </Link>
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === ad.id ? null : ad.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-white/60" />
                                            </button>

                                            {activeDropdown === ad.id && (
                                                <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">

                                                    {/* Actions de Modération */}
                                                    {ad.moderationStatus !== 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleAction('approve', ad.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Valider / Approuver
                                                        </button>
                                                    )}

                                                    {ad.moderationStatus !== 'REJECTED' && (
                                                        <button
                                                            onClick={() => handleReject(ad.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Rejeter
                                                        </button>
                                                    )}

                                                    <div className="border-t border-white/10 my-1"></div>

                                                    {ad.status !== 'active' && (
                                                        <button
                                                            onClick={() => handleAction('updateStatus', ad.id, 'active')}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Marquer active
                                                        </button>
                                                    )}
                                                    {ad.status !== 'sold' && (
                                                        <button
                                                            onClick={() => handleAction('updateStatus', ad.id, 'sold')}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Marquer vendue
                                                        </button>
                                                    )}
                                                    {ad.status !== 'archived' && (
                                                        <button
                                                            onClick={() => handleAction('updateStatus', ad.id, 'archived')}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                            Archiver
                                                        </button>
                                                    )}

                                                    <div className="border-t border-white/10 my-1"></div>

                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                                                                handleAction('delete', ad.id);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/5">
                {ads.map((ad) => {
                    const statusInfo = statusConfig[ad.status] || statusConfig.active;
                    const moderationInfo = moderationConfig[ad.moderationStatus] || moderationConfig.PENDING;
                    const StatusIcon = statusInfo.icon;
                    const ModIcon = moderationInfo.icon;

                    return (
                        <div
                            key={ad.id}
                            className={`p-4 ${loading === ad.id ? 'opacity-50' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className="w-20 h-20 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden">
                                    {ad.images[0] ? (
                                        <Image src={ad.images[0]} alt="" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <Eye className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-white font-medium truncate">{ad.title}</p>
                                            <p className="text-emerald-400 font-semibold text-sm">
                                                {ad.price.toLocaleString('fr-FR')} DA
                                            </p>
                                        </div>
                                        <div className="relative ad-menu-container">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === ad.id ? null : ad.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-white/60" />
                                            </button>

                                            {activeDropdown === ad.id && (
                                                <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">

                                                    {/* Actions Modération Mobile */}
                                                    {ad.moderationStatus !== 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleAction('approve', ad.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Valider
                                                        </button>
                                                    )}
                                                    {ad.moderationStatus !== 'REJECTED' && (
                                                        <button
                                                            onClick={() => handleReject(ad.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Rejeter
                                                        </button>
                                                    )}

                                                    <div className="border-t border-white/10 my-1"></div>

                                                    <Link
                                                        href={`/annonces/${ad.id}`}
                                                        target="_blank"
                                                        className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Voir l&apos;annonce
                                                    </Link>
                                                    {ad.status !== 'active' && (
                                                        <button
                                                            onClick={() => handleAction('updateStatus', ad.id, 'active')}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            Marquer active
                                                        </button>
                                                    )}
                                                    {ad.status !== 'archived' && (
                                                        <button
                                                            onClick={() => handleAction('updateStatus', ad.id, 'archived')}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                                                        >
                                                            <Archive className="w-4 h-4 text-gray-400" />
                                                            Archiver
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Supprimer cette annonce ?')) {
                                                                handleAction('delete', ad.id);
                                                            }
                                                        }}
                                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 border-t border-white/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${moderationInfo.color}`}>
                                            <ModIcon className="w-3 h-3" />
                                            {moderationInfo.label}
                                        </span>

                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusInfo.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </span>
                                        <span className="text-white/40 text-xs flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {ad.views}
                                        </span>
                                        {ad._count.reports > 0 && (
                                            <span className="text-red-400 text-xs px-2 py-0.5 bg-red-500/20 rounded-full flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                {ad._count.reports}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/40 text-xs mt-2">
                                        Par {ad.user.name || 'Utilisateur'} • {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true, locale: fr })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {ads.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/60">Aucune annonce trouvée</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <p className="text-white/40 text-sm">
                        Page {pagination.page} sur {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
