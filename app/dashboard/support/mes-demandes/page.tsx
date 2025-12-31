"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
    MessageCircle,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Plus,
    Inbox,
    X,
    Calendar,
    User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Ticket {
    id: string;
    subject: string;
    message: string;
    category: string;
    status: string;
    adminResponse?: string;
    respondedAt?: string;
    createdAt: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    QUESTION: { label: 'Question', icon: '❓' },
    BUG: { label: 'Bug', icon: '🐛' },
    REPORT_CONTENT: { label: 'Signalement', icon: '⚠️' },
    SUGGESTION: { label: 'Suggestion', icon: '💡' },
    ACCOUNT: { label: 'Compte', icon: '👤' },
    PAYMENT: { label: 'Paiement', icon: '💳' },
    OTHER: { label: 'Autre', icon: '📝' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    OPEN: { label: 'En attente', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    IN_PROGRESS: { label: 'En cours', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    RESOLVED: { label: 'Répondu', color: 'text-green-700', bgColor: 'bg-green-100' },
    CLOSED: { label: 'Fermé', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export default function MesDemandesPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTickets();
        }
    }, [isAuthenticated]);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/support');
            const data = await res.json();

            if (data.success) {
                setTickets(data.data);
            }
        } catch (err) {
            console.error('Erreur chargement tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    // Stats
    const stats = {
        total: tickets.length,
        pending: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-primary to-orange-500 rounded-xl">
                            <Inbox className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes demandes</h1>
                    </div>
                    <p className="text-gray-500">Suivez l'état de vos demandes de support</p>
                </div>
                <Link
                    href="/dashboard/support"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nouvelle demande
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-500">Total</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-sm text-gray-500">En attente</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                    <p className="text-sm text-gray-500">Répondus</p>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande</h3>
                        <p className="text-gray-500 mb-6">
                            Vous n'avez pas encore envoyé de demande de support.
                        </p>
                        <Link
                            href="/dashboard/support"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Créer une demande
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {tickets.map((ticket) => {
                            const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                            const categoryConfig = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS.OTHER;
                            const hasResponse = !!ticket.adminResponse;

                            return (
                                <div
                                    key={ticket.id}
                                    className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${hasResponse ? 'bg-green-100' : 'bg-gray-100'}`}>
                                            {hasResponse ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <span>{categoryConfig.icon}</span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
                                                        {ticket.subject}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                                                        {ticket.message}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {hasResponse && (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                                            Nouvelle réponse
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>

                                            {/* Meta */}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {categoryConfig.icon} {categoryConfig.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_CONFIG[selectedTicket.status]?.bgColor} ${STATUS_CONFIG[selectedTicket.status]?.color}`}>
                                            {STATUS_CONFIG[selectedTicket.status]?.label}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {CATEGORY_LABELS[selectedTicket.category]?.icon} {CATEGORY_LABELS[selectedTicket.category]?.label}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="p-2 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* User Message */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <User className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Vous</span>
                                    <span className="text-xs text-gray-400">
                                        {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>
                                <div className="ml-8 bg-gray-100 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            {/* Admin Response */}
                            {selectedTicket.adminResponse ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                                            <MessageCircle className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">Équipe Support</span>
                                        {selectedTicket.respondedAt && (
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(selectedTicket.respondedAt), { addSuffix: true, locale: fr })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-8 bg-green-50 border border-green-200 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                                        {selectedTicket.adminResponse}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <p className="text-gray-600 font-medium">En attente de réponse</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Notre équipe vous répondra dans les plus brefs délais.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <Link
                                href="/dashboard/support"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Nouvelle demande
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
