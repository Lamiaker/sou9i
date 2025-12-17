"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    MoreVertical,
    Shield,
    ShieldOff,
    BadgeCheck,
    BadgeX,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    Phone,
    MapPin,
    ShoppingBag,
    Star,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface User {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    city: string | null;
    avatar: string | null;
    role: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'TRUSTED' | 'REJECTED';
    isTrusted: boolean;
    rejectionReason: string | null;
    createdAt: Date | string;
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

interface UsersTableProps {
    users: User[];
    pagination: Pagination;
}

export default function UsersTable({ users, pagination }: UsersTableProps) {
    const router = useRouter();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: string, userId: string, extraData: any = {}) => {
        // Confirmation pour Trusted User
        if (action === 'verify' && extraData?.trusted === true) {
            const confirmed = window.confirm(
                "⚠️ ATTENTION : ACTION SENSIBLE\n\n" +
                "Vous êtes sur le point de marquer cet utilisateur comme 'De Confiance'.\n" +
                "Cela signifie que toutes ses futures annonces seront approuvées AUTOMATIQUEMENT sans modération manuelle.\n\n" +
                "Confirmez-vous cette action ?"
            );
            if (!confirmed) return;
        }

        setLoading(userId);
        setActiveDropdown(null);

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, userId, ...extraData }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Action failed');
            }

            // Notification simple (idealement utiliser un toast)
            // alert(data.message); 
            router.refresh();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.message || 'Une erreur est survenue');
        } finally {
            setLoading(null);
        }
    };

    const handleReject = (userId: string) => {
        const reason = prompt("Veuillez saisir le motif du rejet (ex: Numéro invalide, Photo incorecte...)");
        if (reason) {
            handleAction('reject', userId, { reason });
        }
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.push(`/admin/users?${params.toString()}`);
    };

    const getStatusBadge = (user: User) => {
        switch (user.verificationStatus) {
            case 'TRUSTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Star className="w-3 h-3 fill-emerald-400" />
                        Confiance
                    </span>
                );
            case 'VERIFIED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <BadgeCheck className="w-3 h-3" />
                        Vérifié
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30" title={user.rejectionReason || ''}>
                        <BadgeX className="w-3 h-3" />
                        Rejeté
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/50 border border-white/10">
                        <AlertCircle className="w-3 h-3" />
                        En attente
                    </span>
                );
        }
    };

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Utilisateur</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">État du compte</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Rôle</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Annonces</th>
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Inscrit</th>
                            <th className="text-right px-6 py-4 text-white/60 text-sm font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className={`hover:bg-white/5 transition-colors ${loading === user.id ? 'opacity-50' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-bold text-sm">
                                                    {user.name?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    {user.name || 'Utilisateur'}
                                                </span>
                                            </div>
                                            <span className="text-white/40 text-sm">{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        {getStatusBadge(user)}
                                        {user.verificationStatus === 'REJECTED' && user.rejectionReason && (
                                            <span className="text-xs text-red-400/80 max-w-[150px] truncate" title={user.rejectionReason}>
                                                Raison : {user.rejectionReason}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {user.phone && (
                                            <div className="flex items-center gap-2 text-white/60 text-xs">
                                                <Phone className="w-3 h-3" />
                                                {user.phone}
                                            </div>
                                        )}
                                        {user.city && (
                                            <div className="flex items-center gap-2 text-white/60 text-xs">
                                                <MapPin className="w-3 h-3" />
                                                {user.city}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'bg-white/10 text-white/60 border border-white/10'
                                        }`}>
                                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-white/60">
                                        <ShoppingBag className="w-4 h-4" />
                                        {user._count.ads}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white/40 text-sm">
                                    {formatDistanceToNow(new Date(user.createdAt), {
                                        addSuffix: true,
                                        locale: fr
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5 text-white/60" />
                                        </button>

                                        {activeDropdown === user.id && (
                                            <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">

                                                {/* Actions de vérification */}
                                                {user.verificationStatus !== 'TRUSTED' && (
                                                    <button
                                                        onClick={() => handleAction('verify', user.id, { trusted: true })}
                                                        className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        title="Les annonces de cet utilisateur seront auto-validées"
                                                    >
                                                        <Star className="w-4 h-4" />
                                                        Marquer comme Confiance
                                                    </button>
                                                )}

                                                {user.verificationStatus !== 'VERIFIED' && user.verificationStatus !== 'TRUSTED' && (
                                                    <button
                                                        onClick={() => handleAction('verify', user.id, { trusted: false })}
                                                        className="w-full px-4 py-3 text-left text-sm text-blue-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                    >
                                                        <BadgeCheck className="w-4 h-4" />
                                                        Vérifier (Standard)
                                                    </button>
                                                )}

                                                {(user.verificationStatus === 'VERIFIED' || user.verificationStatus === 'TRUSTED') && (
                                                    <button
                                                        onClick={() => handleAction('unverify', user.id)}
                                                        className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                    >
                                                        <BadgeX className="w-4 h-4" />
                                                        Retirer la vérification
                                                    </button>
                                                )}

                                                {user.verificationStatus !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="w-full px-4 py-3 text-left text-sm text-orange-400 hover:bg-white/10 flex items-center gap-2 transition-colors border-t border-white/10"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                        Rejeter / Invalider
                                                    </button>
                                                )}

                                                {/* Actions Rôle Admmin */}
                                                <div className="border-t border-white/10 mt-1 pt-1">
                                                    {user.role === 'ADMIN' ? (
                                                        <button
                                                            onClick={() => handleAction('demote', user.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <ShieldOff className="w-4 h-4" />
                                                            Rétrograder en USER
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAction('promote', user.id)}
                                                            className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Shield className="w-4 h-4 text-cyan-400" />
                                                            Promouvoir en ADMIN
                                                        </button>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                                                            handleAction('delete', user.id);
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-white/5">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`p-4 ${loading === user.id ? 'opacity-50' : ''}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white font-bold">
                                        {user.name?.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-white font-medium truncate">
                                        {user.name || 'Utilisateur'}
                                    </span>
                                    <span className={`ml-auto px-2 py-0.5 rounded-full text-xs ${user.role === 'ADMIN'
                                        ? 'bg-purple-500/20 text-cyan-400'
                                        : 'bg-white/10 text-white/60'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <p className="text-white/40 text-sm truncate mb-2">{user.email}</p>

                                <div className="mb-2">
                                    {getStatusBadge(user)}
                                </div>

                                <div className="flex items-center gap-4 mt-2 text-white/40 text-xs">
                                    <span className="flex items-center gap-1">
                                        <ShoppingBag className="w-3 h-3" />
                                        {user._count.ads} annonces
                                    </span>
                                    <span>
                                        {formatDistanceToNow(new Date(user.createdAt), {
                                            addSuffix: true,
                                            locale: fr
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-5 h-5 text-white/60" />
                                </button>

                                {activeDropdown === user.id && (
                                    <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                                        {/* Actions Mobile identiques / simplifiées si besoin */}
                                        {user.verificationStatus !== 'TRUSTED' && (
                                            <button
                                                onClick={() => handleAction('verify', user.id, { trusted: true })}
                                                className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2"
                                            >
                                                <Star className="w-4 h-4" />
                                                De Confiance
                                            </button>
                                        )}

                                        {user.verificationStatus !== 'VERIFIED' && user.verificationStatus !== 'TRUSTED' && (
                                            <button
                                                onClick={() => handleAction('verify', user.id, { trusted: false })}
                                                className="w-full px-4 py-3 text-left text-sm text-blue-400 hover:bg-white/10 flex items-center gap-2"
                                            >
                                                <BadgeCheck className="w-4 h-4" />
                                                Vérifier
                                            </button>
                                        )}

                                        {(user.verificationStatus === 'VERIFIED' || user.verificationStatus === 'TRUSTED') && (
                                            <button
                                                onClick={() => handleAction('unverify', user.id)}
                                                className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/10 flex items-center gap-2"
                                            >
                                                <BadgeX className="w-4 h-4" />
                                                Retirer vérif.
                                            </button>
                                        )}

                                        {user.verificationStatus !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                className="w-full px-4 py-3 text-left text-sm text-orange-400 hover:bg-white/10 flex items-center gap-2 border-t border-white/10"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                Rejeter
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                if (confirm('Supprimer cet utilisateur ?')) {
                                                    handleAction('delete', user.id);
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
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {users.length === 0 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <User className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/60">Aucun utilisateur trouvé</p>
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
