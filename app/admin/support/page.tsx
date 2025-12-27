"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    MessageCircle,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Mail,
    Calendar,
    ChevronRight,
    Send,
    X,
    RefreshCw,
    Inbox,
    ArrowUpRight,
    Trash2
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
    user?: {
        id: string;
        name?: string;
        email: string;
        avatar?: string;
    };
    guestEmail?: string;
    guestName?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    QUESTION: { label: 'Question', icon: '❓', color: 'from-blue-500 to-cyan-500' },
    BUG: { label: 'Bug', icon: '🐛', color: 'from-red-500 to-orange-500' },
    REPORT_CONTENT: { label: 'Signalement', icon: '⚠️', color: 'from-orange-500 to-amber-500' },
    SUGGESTION: { label: 'Suggestion', icon: '💡', color: 'from-yellow-500 to-amber-500' },
    ACCOUNT: { label: 'Compte', icon: '👤', color: 'from-purple-500 to-pink-500' },
    PAYMENT: { label: 'Paiement', icon: '💳', color: 'from-emerald-500 to-teal-500' },
    OTHER: { label: 'Autre', icon: '📝', color: 'from-gray-500 to-gray-600' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
    OPEN: { label: 'Nouveau', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30', dotColor: 'bg-blue-500' },
    IN_PROGRESS: { label: 'En cours', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30', dotColor: 'bg-yellow-500' },
    RESOLVED: { label: 'Résolu', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30', dotColor: 'bg-green-500' },
    CLOSED: { label: 'Fermé', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30', dotColor: 'bg-gray-400' },
};

const TABS = [
    { name: 'Nouveaux', href: '/admin/support', status: 'OPEN', icon: AlertCircle, color: 'from-blue-500 to-cyan-500' },
    { name: 'En cours', href: '/admin/support/in-progress', status: 'IN_PROGRESS', icon: Clock, color: 'from-yellow-500 to-orange-500' },
    { name: 'Résolus', href: '/admin/support/resolved', status: 'RESOLVED', icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
    { name: 'Fermés', href: '/admin/support/closed', status: 'CLOSED', icon: Inbox, color: 'from-gray-500 to-gray-600' },
    { name: 'Tous', href: '/admin/support/all', status: '', icon: MessageCircle, color: 'from-primary to-orange-500' },
];

interface AdminSupportLayoutProps {
    statusFilter?: string;
    children?: React.ReactNode;
}

export default function AdminSupportLayout({ statusFilter = 'OPEN' }: AdminSupportLayoutProps) {
    const pathname = usePathname();
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [response, setResponse] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const res = await fetch('/api/support');
            const data = await res.json();

            if (data.success) {
                setAllTickets(data.data);
            }
        } catch (err) {
            console.error('Erreur chargement tickets:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchTickets(), 30000);
        return () => clearInterval(interval);
    }, [fetchTickets]);

    // Filter tickets based on status
    const tickets = statusFilter
        ? allTickets.filter(t => t.status === statusFilter)
        : allTickets;

    const handleRespond = async () => {
        if (!selectedTicket || !response.trim()) return;

        setSending(true);
        setError(null);

        try {
            const res = await fetch(`/api/support/${selectedTicket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminResponse: response }),
            });

            const data = await res.json();

            if (data.success) {
                setSelectedTicket(null);
                setResponse('');
                fetchTickets();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Erreur lors de l\'envoi');
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (ticketId: string, status: string) => {
        try {
            const res = await fetch(`/api/support/${ticketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();

            if (data.success) {
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket({ ...selectedTicket, status });
                }
                fetchTickets();
            }
        } catch (err) {
            console.error('Erreur changement statut:', err);
        }
    };

    const handleDelete = async (ticketId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) return;

        try {
            const res = await fetch(`/api/support/${ticketId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                setSelectedTicket(null);
                fetchTickets();
            }
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    // Stats for tabs
    const getCount = (status: string) => {
        if (!status) return allTickets.length;
        return allTickets.filter(t => t.status === status).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const currentTab = TABS.find(t => t.href === pathname) || TABS[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTab.color} flex items-center justify-center`}>
                            <currentTab.icon className="w-5 h-5 text-white" />
                        </div>
                        Support & Assistance
                    </h1>
                    <p className="text-white/60">
                        Gérez les demandes de support des utilisateurs
                    </p>
                </div>
                <button
                    onClick={() => fetchTickets(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.href;
                    const count = getCount(tab.status);
                    const TabIcon = tab.icon;

                    // Couleur active par statut
                    const activeColors: Record<string, string> = {
                        'OPEN': 'bg-blue-500 text-white',
                        'IN_PROGRESS': 'bg-yellow-500 text-white',
                        'RESOLVED': 'bg-emerald-500 text-white',
                        'CLOSED': 'bg-gray-500 text-white',
                        '': 'bg-primary text-white', // Tous
                    };

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                                    ? activeColors[tab.status]
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                }`}
                        >
                            <TabIcon className="w-4 h-4" />
                            {tab.name}
                            <span className={`text-xs font-semibold ${isActive ? 'opacity-90' : 'text-white/40'}`}>
                                {count}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Tickets List */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {tickets.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <currentTab.icon className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Aucun ticket {currentTab.name.toLowerCase()}
                        </h3>
                        <p className="text-white/40 max-w-sm mx-auto">
                            {statusFilter === 'OPEN'
                                ? "Aucune nouvelle demande de support."
                                : `Aucun ticket avec le statut "${currentTab.name}".`}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {tickets.map((ticket) => {
                            const statusConfig = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                            const categoryConfig = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS.OTHER;

                            return (
                                <div
                                    key={ticket.id}
                                    className="p-5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedTicket(ticket)}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Avatar/Icon */}
                                        <div className="flex-shrink-0">
                                            {ticket.user?.avatar ? (
                                                <Image
                                                    src={ticket.user.avatar}
                                                    alt=""
                                                    width={44}
                                                    height={44}
                                                    className="w-11 h-11 rounded-xl object-cover border border-white/10"
                                                />
                                            ) : (
                                                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${categoryConfig.color} flex items-center justify-center text-lg`}>
                                                    {categoryConfig.icon}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                                                        {ticket.subject}
                                                    </h3>
                                                    <p className="text-sm text-white/50 mt-0.5">
                                                        {ticket.user?.name || ticket.guestName || 'Visiteur'}
                                                        <span className="mx-1.5">•</span>
                                                        <span className="text-white/30">{ticket.user?.email || ticket.guestEmail}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>

                                            {/* Message preview */}
                                            <p className="text-sm text-white/40 mt-2 line-clamp-2">
                                                {ticket.message}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                    <span>{categoryConfig.icon}</span>
                                                    {categoryConfig.label}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-white/30">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true, locale: fr })}
                                                </span>
                                                {ticket.adminResponse && (
                                                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Répondu
                                                    </span>
                                                )}
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
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedTicket(null)}
                >
                    <div
                        className="bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${STATUS_CONFIG[selectedTicket.status]?.bgColor} ${STATUS_CONFIG[selectedTicket.status]?.color}`}>
                                            {STATUS_CONFIG[selectedTicket.status]?.label}
                                        </span>
                                        <span className="text-sm text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                            {CATEGORY_LABELS[selectedTicket.category]?.icon} {CATEGORY_LABELS[selectedTicket.category]?.label}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(selectedTicket.id)}
                                        className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* User Info */}
                            <div className="p-6 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {selectedTicket.user?.avatar ? (
                                            <Image
                                                src={selectedTicket.user.avatar}
                                                alt=""
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center border-2 border-white/10">
                                                <User className="w-7 h-7 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white text-lg">
                                            {selectedTicket.user?.name || selectedTicket.guestName || 'Visiteur anonyme'}
                                        </p>
                                        <p className="text-sm text-white/50 flex items-center gap-1.5">
                                            <Mail className="w-4 h-4" />
                                            {selectedTicket.user?.email || selectedTicket.guestEmail}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-white/40">
                                            {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true, locale: fr })}
                                        </p>
                                        {selectedTicket.user && (
                                            <a
                                                href={`/admin/users?search=${selectedTicket.user.email}`}
                                                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 mt-1"
                                            >
                                                Voir le profil <ArrowUpRight className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </h3>
                                <div className="bg-white/5 rounded-xl p-5 text-white/80 whitespace-pre-wrap leading-relaxed border border-white/10">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            {/* Admin Response (if exists) */}
                            {selectedTicket.adminResponse && (
                                <div className="px-6 pb-6">
                                    <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        Votre réponse
                                    </h3>
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-white/80 whitespace-pre-wrap leading-relaxed">
                                        {selectedTicket.adminResponse}
                                        {selectedTicket.respondedAt && (
                                            <p className="text-xs text-green-400/70 mt-4 pt-3 border-t border-green-500/20">
                                                ✓ Répondu {formatDistanceToNow(new Date(selectedTicket.respondedAt), { addSuffix: true, locale: fr })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reply Form */}
                        {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                            <div className="p-6 border-t border-white/10 bg-white/5">
                                <h3 className="text-sm font-semibold text-white/60 mb-3">Répondre</h3>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-white placeholder-white/30"
                                    placeholder="Écrivez votre réponse..."
                                />
                                {error && (
                                    <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </p>
                                )}

                                {/* Status Pills */}
                                <div className="mt-4 mb-4">
                                    <p className="text-xs text-white/40 mb-2">Changer le statut :</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: 'OPEN', label: 'Nouveau', icon: '📬', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30' },
                                            { value: 'IN_PROGRESS', label: 'En cours', icon: '⏳', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30' },
                                            { value: 'RESOLVED', label: 'Résolu', icon: '✅', color: 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30' },
                                            { value: 'CLOSED', label: 'Fermé', icon: '📁', color: 'bg-gray-500/20 border-gray-500/40 text-gray-400 hover:bg-gray-500/30' },
                                        ].map((status) => (
                                            <button
                                                key={status.value}
                                                onClick={() => handleStatusChange(selectedTicket.id, status.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${selectedTicket.status === status.value
                                                    ? `${status.color} ring-2 ring-offset-1 ring-offset-slate-900`
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                                                    }`}
                                            >
                                                <span>{status.icon}</span>
                                                {status.label}
                                                {selectedTicket.status === status.value && (
                                                    <CheckCircle className="w-3 h-3 ml-0.5" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleRespond}
                                        disabled={!response.trim() || sending}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {sending ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        <span>Envoyer</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Already resolved notice */}
                        {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                            <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                                <p className="text-sm text-white/50">
                                    Ce ticket est {selectedTicket.status === 'RESOLVED' ? 'résolu' : 'fermé'}.
                                </p>
                                <button
                                    onClick={() => handleStatusChange(selectedTicket.id, 'OPEN')}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                >
                                    Rouvrir le ticket
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
