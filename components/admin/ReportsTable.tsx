"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Clock,
    ShoppingBag,
    ExternalLink,
    Trash2,
    Ban,
    Eye,
    ChevronDown,
    X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

interface Report {
    id: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: Date;
    reporter: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
    };
    reportedUser: {
        id: string;
        name: string | null;
        email: string;
        avatar: string | null;
    } | null;
    ad: {
        id: string;
        title: string;
        images: string[];
    } | null;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ReportsTableProps {
    reports: Report[];
    pagination: Pagination;
    onMutate?: () => void;
    basePath?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
    RESOLVED: { label: 'Résolu', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    REJECTED: { label: 'Rejeté', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
};

export default function ReportsTable({ reports, pagination, onMutate, basePath = '/admin/reports' }: ReportsTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [showActionModal, setShowActionModal] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState('');

    const handleAction = async (action: string, reportId: string, reason?: string) => {
        setLoading(reportId);
        setShowActionModal(null);

        try {
            const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reportId, reason }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Action failed');
            }

            // Afficher un message de succès
            alert(data.message || 'Action effectuée avec succès');

            // Rafraîchir via SWR ou router
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
            setActionReason('');
        }
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.push(`${basePath}?${params.toString()}`);
    };

    // Déterminer le type de signalement
    const getReportType = (report: Report): 'ad' | 'user' => {
        return report.ad ? 'ad' : 'user';
    };

    return (
        <div className="space-y-4">
            {reports.length === 0 ? (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-white/60 text-lg font-medium">Aucun signalement</p>
                    <p className="text-white/40 text-sm mt-1">
                        Tout est en ordre ! ✨
                    </p>
                </div>
            ) : (
                reports.map((report) => {
                    const statusInfo = statusConfig[report.status] || statusConfig.PENDING;
                    const StatusIcon = statusInfo.icon;
                    const reportType = getReportType(report);

                    return (
                        <div
                            key={report.id}
                            className={`rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden transition-opacity ${loading === report.id ? 'opacity-50' : ''}`}
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{report.reason}</h3>
                                            <p className="text-white/40 text-sm">
                                                {formatDistanceToNow(new Date(report.createdAt), {
                                                    addSuffix: true,
                                                    locale: fr
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${reportType === 'ad' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
                                            {reportType === 'ad' ? (
                                                <>
                                                    <ShoppingBag className="w-3.5 h-3.5" />
                                                    Annonce
                                                </>
                                            ) : (
                                                <>
                                                    <Ban className="w-3.5 h-3.5" />
                                                    Utilisateur
                                                </>
                                            )}
                                        </span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                            <StatusIcon className="w-3.5 h-3.5" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                {report.details && (
                                    <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-white/70 text-sm">{report.details}</p>
                                    </div>
                                )}

                                {/* Reporter & Target */}
                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                    {/* Reporter */}
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Signalé par</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                                <Image
                                                    src={report.reporter.avatar || "/user.png"}
                                                    alt=""
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {report.reporter.name || 'Utilisateur'}
                                                </p>
                                                <p className="text-white/40 text-xs truncate">
                                                    {report.reporter.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Target (User or Ad) */}
                                    {report.ad ? (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Annonce signalée</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden relative border border-white/10">
                                                    {report.ad.images[0] ? (
                                                        <Image
                                                            src={report.ad.images[0]}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <ShoppingBag className="w-5 h-5 text-white/20 m-auto" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {report.ad.title}
                                                    </p>
                                                    <Link
                                                        href={`/annonces/${report.ad.id}`}
                                                        target="_blank"
                                                        className="text-cyan-400 text-xs hover:underline inline-flex items-center gap-1"
                                                    >
                                                        Voir l&apos;annonce
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : report.reportedUser ? (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Utilisateur signalé</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                                    <Image
                                                        src={report.reportedUser.avatar || "/user.png"}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {report.reportedUser.name || 'Utilisateur'}
                                                    </p>
                                                    <p className="text-white/40 text-xs truncate">
                                                        {report.reportedUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Actions */}
                                {report.status === 'PENDING' && (
                                    <div className="pt-4 border-t border-white/10">
                                        {/* Actions rapides */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <button
                                                onClick={() => handleAction('reject', report.id)}
                                                disabled={loading === report.id}
                                                className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                title="Faux signalement, ignorer"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Ignorer
                                            </button>

                                            <button
                                                onClick={() => handleAction('resolve', report.id)}
                                                disabled={loading === report.id}
                                                className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                title="Marquer comme résolu sans action"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Résolu
                                            </button>
                                        </div>

                                        {/* Actions avec conséquences */}
                                        <div className="flex flex-wrap gap-2">
                                            {reportType === 'ad' && (
                                                <>
                                                    <button
                                                        onClick={() => setShowActionModal(`reject_ad_${report.id}`)}
                                                        disabled={loading === report.id}
                                                        className="px-3 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm font-medium rounded-xl hover:bg-orange-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Masquer l&apos;annonce
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            if (confirm('⚠️ Êtes-vous sûr de vouloir SUPPRIMER cette annonce définitivement ?')) {
                                                                handleAction('delete_ad', report.id);
                                                            }
                                                        }}
                                                        disabled={loading === report.id}
                                                        className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Supprimer l&apos;annonce
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => setShowActionModal(`ban_user_${report.id}`)}
                                                disabled={loading === report.id}
                                                className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                <Ban className="w-4 h-4" />
                                                Bannir l&apos;utilisateur
                                            </button>

                                            {reportType === 'ad' && (
                                                <button
                                                    onClick={() => setShowActionModal(`delete_ad_ban_user_${report.id}`)}
                                                    disabled={loading === report.id}
                                                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Supprimer + Bannir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal pour saisir la raison */}
                            {showActionModal?.includes(report.id) && (
                                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-md w-full shadow-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white">
                                                {showActionModal.startsWith('ban_user') && '🚫 Bannir l\'utilisateur'}
                                                {showActionModal.startsWith('reject_ad') && '👁️ Masquer l\'annonce'}
                                                {showActionModal.startsWith('delete_ad_ban_user') && '⚠️ Action sévère'}
                                            </h3>
                                            <button
                                                onClick={() => {
                                                    setShowActionModal(null);
                                                    setActionReason('');
                                                }}
                                                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <X className="w-5 h-5 text-white/60" />
                                            </button>
                                        </div>

                                        <p className="text-white/60 text-sm mb-4">
                                            {showActionModal.startsWith('ban_user') && 'L\'utilisateur ne pourra plus se connecter. Veuillez indiquer la raison du bannissement.'}
                                            {showActionModal.startsWith('reject_ad') && 'L\'annonce sera masquée mais pas supprimée. Indiquez la raison du rejet.'}
                                            {showActionModal.startsWith('delete_ad_ban_user') && 'L\'annonce sera supprimée ET l\'utilisateur sera banni. Cette action est irréversible.'}
                                        </p>

                                        <textarea
                                            value={actionReason}
                                            onChange={(e) => setActionReason(e.target.value)}
                                            placeholder="Raison (optionnel mais recommandé)..."
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                                            rows={3}
                                        />

                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => {
                                                    setShowActionModal(null);
                                                    setActionReason('');
                                                }}
                                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const action = showActionModal.split('_').slice(0, -1).join('_');
                                                    handleAction(action, report.id, actionReason);
                                                }}
                                                disabled={loading === report.id}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                                            >
                                                Confirmer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
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
