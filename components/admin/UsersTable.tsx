"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    MoreVertical,
    Shield,
    ShieldOff,
    BadgeCheck,
    BadgeX,
    Trash2,
    User,
    Phone,
    MapPin,
    ShoppingBag,
    Star,
    AlertCircle,
    Copy,
    Check
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';
import AdminPagination from './AdminPagination';

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
    isBanned: boolean;
    banReason: string | null;
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
    onMutate?: () => void;
    basePath?: string; // Chemin de base pour la pagination (par défaut: /admin/users)
}

export default function UsersTable({ users, pagination, onMutate, basePath = '/admin/users' }: UsersTableProps) {
    const router = useRouter();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Fonction pour copier l'ID utilisateur
    const handleCopyId = async (userId: string) => {
        try {
            await navigator.clipboard.writeText(userId);
            setCopiedId(userId);
            setTimeout(() => setCopiedId(null), 2000); // Reset après 2 secondes
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
        }
    };

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Si on clique en dehors du conteneur du menu actif
            if (activeDropdown && !target.closest('.user-menu-container')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

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
            // Utiliser l'endpoint dédié pour le ban/unban, sinon l'endpoint classique
            const endpoint = (action === 'ban' || action === 'unban')
                ? '/api/admin/users/status'
                : '/api/admin/users';

            const res = await fetch(endpoint, {
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
            // Use mutate for instant refresh, fallback to router.refresh
            if (onMutate) {
                onMutate();
            } else {
                router.refresh();
            }
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

    const handleBan = (userId: string) => {
        const reason = prompt("Raison du blocage de l'utilisateur :");
        if (reason) {
            handleAction('ban', userId, { reason });
        }
    };

    const getStatusBadge = (user: User) => {
        // Le bannissement est prioritaire sur l'état de vérification
        if (user.isBanned) {
            return (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-600/20 text-red-500 border border-red-600/30"
                    title={user.banReason || 'Aucune raison spécifiée'}
                >
                    <BadgeX className="w-3 h-3" />
                    Banni
                </span>
            );
        }

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

    const getBanBadge = (user: User) => {
        if (!user.isBanned) return null;
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white border border-red-500 shadow-lg shadow-red-900/20 animate-pulse" title={user.banReason || ''}>
                <BadgeX className="w-2.5 h-2.5" />
                BANNI
            </span>
        );
    };

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            {/* Desktop Table (Visible overflow to prevent clipping dropdowns) */}
            <div className="hidden lg:block overflow-visible">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">ID</th>
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
                                className={`hover:bg-white/5 transition-colors ${loading === user.id ? 'opacity-50' : ''} ${activeDropdown === user.id ? 'relative z-50' : ''}`}
                            >
                                {/* Colonne ID avec bouton copie */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/60 text-xs font-mono bg-white/5 px-2 py-1 rounded" title={user.id}>
                                            {user.id.slice(0, 8)}...
                                        </span>
                                        <button
                                            onClick={() => handleCopyId(user.id)}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all group"
                                            title="Copier l'ID complet"
                                        >
                                            {copiedId === user.id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 transition-colors" />
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                            <Image
                                                src={user.avatar || "/user.png"}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">
                                                    {user.name || 'Utilisateur'}
                                                </span>
                                                {getBanBadge(user)}
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
                                    {user.role !== 'ADMIN' && (
                                        <div className="relative user-menu-container">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-white/60" />
                                            </button>

                                            {activeDropdown === user.id && (
                                                <div className="absolute right-full mr-2 top-0 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">

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

                                                    {/* Actions de Blocage (Masquées pour les admins) */}
                                                    {user.role !== 'ADMIN' && (
                                                        <div className="border-t border-white/10 mt-1 pt-1">
                                                            {user.isBanned ? (
                                                                <button
                                                                    onClick={() => handleAction('unban', user.id)}
                                                                    className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <BadgeCheck className="w-4 h-4" />
                                                                    Débloquer (Unban)
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleBan(user.id)}
                                                                    className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <BadgeX className="w-4 h-4" />
                                                                    Bannir / Bloquer
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Action de suppression (Masquée pour les admins) */}
                                                    {user.role !== 'ADMIN' && (
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
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div >

            {/* Mobile Cards */}
            < div className="lg:hidden divide-y divide-white/5" >
                {
                    users.map((user) => (
                        <div
                            key={user.id}
                            className={`p-4 ${loading === user.id ? 'opacity-50' : ''}`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                    <Image
                                        src={user.avatar || "/user.png"}
                                        alt=""
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
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

                                    {/* ID avec bouton copie - Mobile */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-white/50 text-xs font-mono bg-white/5 px-2 py-1 rounded" title={user.id}>
                                            ID: {user.id.slice(0, 12)}...
                                        </span>
                                        <button
                                            onClick={() => handleCopyId(user.id)}
                                            className="p-1 hover:bg-white/10 rounded transition-all"
                                            title="Copier l'ID complet"
                                        >
                                            {copiedId === user.id ? (
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            ) : (
                                                <Copy className="w-3 h-3 text-white/40" />
                                            )}
                                        </button>
                                    </div>

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
                                {user.role !== 'ADMIN' && (
                                    <div className="relative user-menu-container">
                                        <button
                                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5 text-white/60" />
                                        </button>

                                        {activeDropdown === user.id && (
                                            <div className="absolute right-full mr-2 top-0 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
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

                                                {/* Actions de Blocage (Masquées pour les admins) */}
                                                {user.role !== 'ADMIN' && (
                                                    <div className="border-t border-white/10 mt-1 pt-1">
                                                        {user.isBanned ? (
                                                            <button
                                                                onClick={() => handleAction('unban', user.id)}
                                                                className="w-full px-4 py-3 text-left text-sm text-emerald-400 hover:bg-white/10 flex items-center gap-2"
                                                            >
                                                                <BadgeCheck className="w-4 h-4" />
                                                                Débloquer (Unban)
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBan(user.id)}
                                                                className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                                            >
                                                                <BadgeX className="w-4 h-4" />
                                                                Bannir / Bloquer
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {user.role !== 'ADMIN' && (
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
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                }
            </div >

            {/* Empty State */}
            {
                users.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <User className="w-8 h-8 text-white/20" />
                        </div>
                        <p className="text-white/60">Aucun utilisateur trouvé</p>
                    </div>
                )
            }

            {/* Pagination */}
            <AdminPagination pagination={pagination} basePath={basePath} />
        </div >
    );
}
