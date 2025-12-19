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
    User,
    ShoppingBag,
    ExternalLink
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
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
    RESOLVED: { label: 'Résolu', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    REJECTED: { label: 'Rejeté', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: XCircle },
};

export default function ReportsTable({ reports, pagination }: ReportsTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: string, reportId: string) => {
        setLoading(reportId);

        try {
            const res = await fetch('/api/admin/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, reportId }),
            });

            if (!res.ok) {
                throw new Error('Action failed');
            }

            router.refresh();
        } catch (error) {
            console.error('Error:', error);
            alert('Une erreur est survenue');
        } finally {
            setLoading(null);
        }
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        router.push(`/admin/reports?${params.toString()}`);
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
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusInfo.label}
                                    </span>
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
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {report.reporter.avatar ? (
                                                    <Image src={report.reporter.avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white" />
                                                )}
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
                                                <div className="w-10 h-10 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden">
                                                    {report.ad.images[0] ? (
                                                        <Image src={report.ad.images[0]} alt="" width={40} height={40} className="w-full h-full object-cover" />
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
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {report.reportedUser.avatar ? (
                                                        <Image src={report.reportedUser.avatar} alt="" width={40} height={40} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-white" />
                                                    )}
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
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleAction('resolve', report.id)}
                                            disabled={loading === report.id}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Résoudre le signalement
                                        </button>
                                        <button
                                            onClick={() => handleAction('reject', report.id)}
                                            disabled={loading === report.id}
                                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Rejeter
                                        </button>
                                    </div>
                                )}
                            </div>
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
