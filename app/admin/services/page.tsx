"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Briefcase,
    Search,
    RefreshCw,
    Eye,
    Trash2,
    Mail,
    Phone,
    Building,
    Calendar,
    DollarSign,
    Clock,
    FileText,
    CheckCircle,
    XCircle,
    MessageSquare,
    ChevronRight,
    X,
    Send,
    AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ServiceRequest {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    serviceType: string;
    budget: string | null;
    deadline: string | null;
    description: string;
    status: string;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Stats {
    total: number;
    new: number;
    contacted: number;
    inProgress: number;
    completed: number;
}

const SERVICE_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    SITE_VITRINE: { label: 'Site Vitrine', icon: '🌐', color: 'from-blue-500 to-cyan-500' },
    ECOMMERCE: { label: 'E-commerce', icon: '🛒', color: 'from-green-500 to-emerald-500' },
    APP_WEB: { label: 'Application Web', icon: '💻', color: 'from-purple-500 to-pink-500' },
    APP_MOBILE: { label: 'Application Mobile', icon: '📱', color: 'from-orange-500 to-amber-500' },
    DESIGN_UX: { label: 'Design & UX', icon: '🎨', color: 'from-pink-500 to-rose-500' },
    CONSULTING: { label: 'Conseil & Stratégie', icon: '🚀', color: 'from-cyan-500 to-teal-500' },
    OTHER: { label: 'Autre', icon: '📝', color: 'from-gray-500 to-gray-600' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
    NEW: { label: 'Nouveau', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/30', icon: '📬' },
    CONTACTED: { label: 'Contacté', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30', icon: '📞' },
    IN_PROGRESS: { label: 'En cours', color: 'text-purple-400', bgColor: 'bg-purple-500/20 border-purple-500/30', icon: '⏳' },
    COMPLETED: { label: 'Terminé', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30', icon: '✅' },
    CANCELLED: { label: 'Annulé', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30', icon: '❌' },
};

export default function AdminServicesPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    const fetchRequests = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.set('status', filterStatus);
            if (searchQuery) params.set('search', searchQuery);

            const response = await fetch(`/api/admin/services?${params.toString()}`);
            const data = await response.json();

            setRequests(data.requests || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error('Erreur fetch requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus, searchQuery]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchRequests(), 30000);
        return () => clearInterval(interval);
    }, [fetchRequests]);

    const handleUpdateStatus = async (id: string, status: string) => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes }),
            });

            if (response.ok) {
                const updated = await response.json();
                if (selectedRequest?.id === id) {
                    setSelectedRequest(updated);
                }
                fetchRequests();
            }
        } catch (error) {
            console.error('Erreur update:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedRequest) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/admin/services/${selectedRequest.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes }),
            });

            if (response.ok) {
                const updated = await response.json();
                setSelectedRequest(updated);
                fetchRequests();
            }
        } catch (error) {
            console.error('Erreur save notes:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette demande ?')) return;

        try {
            const response = await fetch(`/api/admin/services/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setSelectedRequest(null);
                fetchRequests();
            }
        } catch (error) {
            console.error('Erreur delete:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        Demandes de Services
                    </h1>
                    <p className="text-white/60">
                        Gérez les demandes de projets web et mobile
                    </p>
                </div>
                <button
                    onClick={() => fetchRequests(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm font-medium transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Actualiser
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4">
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                        <p className="text-sm text-white/50">Total</p>
                    </div>
                    <div className="rounded-2xl bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 p-4">
                        <p className="text-2xl font-bold text-blue-400">{stats.new}</p>
                        <p className="text-sm text-blue-400/70">Nouveaux</p>
                    </div>
                    <div className="rounded-2xl bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 p-4">
                        <p className="text-2xl font-bold text-yellow-400">{stats.contacted}</p>
                        <p className="text-sm text-yellow-400/70">Contactés</p>
                    </div>
                    <div className="rounded-2xl bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 p-4">
                        <p className="text-2xl font-bold text-purple-400">{stats.inProgress}</p>
                        <p className="text-sm text-purple-400/70">En cours</p>
                    </div>
                    <div className="rounded-2xl bg-green-500/10 backdrop-blur-xl border border-green-500/20 p-4">
                        <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                        <p className="text-sm text-green-400/70">Terminés</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, entreprise..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-white/40"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-white"
                >
                    <option value="" className="bg-slate-900">Tous les statuts</option>
                    <option value="NEW" className="bg-slate-900">Nouveaux</option>
                    <option value="CONTACTED" className="bg-slate-900">Contactés</option>
                    <option value="IN_PROGRESS" className="bg-slate-900">En cours</option>
                    <option value="COMPLETED" className="bg-slate-900">Terminés</option>
                    <option value="CANCELLED" className="bg-slate-900">Annulés</option>
                </select>
            </div>

            {/* Requests List */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {requests.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-white/40" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Aucune demande
                        </h3>
                        <p className="text-white/40 max-w-sm mx-auto">
                            Aucune demande de service trouvée.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {requests.map((request) => {
                            const statusConfig = STATUS_CONFIG[request.status] || STATUS_CONFIG.NEW;
                            const serviceConfig = SERVICE_TYPE_LABELS[request.serviceType] || SERVICE_TYPE_LABELS.OTHER;

                            return (
                                <div
                                    key={request.id}
                                    className="p-5 hover:bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setAdminNotes(request.adminNotes || '');
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${serviceConfig.color} flex items-center justify-center text-lg flex-shrink-0`}>
                                            {serviceConfig.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                                                        {request.name}
                                                    </h3>
                                                    <p className="text-sm text-white/50 mt-0.5">
                                                        {request.email}
                                                        {request.company && (
                                                            <>
                                                                <span className="mx-1.5">•</span>
                                                                <span className="text-white/30">{request.company}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>

                                            {/* Description preview */}
                                            <p className="text-sm text-white/40 mt-2 line-clamp-2">
                                                {request.description}
                                            </p>

                                            {/* Meta */}
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                                                    <span>{serviceConfig.icon}</span>
                                                    {serviceConfig.label}
                                                </span>
                                                {request.budget && (
                                                    <span className="flex items-center gap-1 text-xs text-white/30">
                                                        <DollarSign className="w-3 h-3" />
                                                        {request.budget}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-xs text-white/30">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true, locale: fr })}
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

            {/* Detail Modal */}
            {selectedRequest && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedRequest(null)}
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
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${STATUS_CONFIG[selectedRequest.status]?.bgColor} ${STATUS_CONFIG[selectedRequest.status]?.color}`}>
                                            {STATUS_CONFIG[selectedRequest.status]?.label}
                                        </span>
                                        <span className="text-sm text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                            {SERVICE_TYPE_LABELS[selectedRequest.serviceType]?.icon} {SERVICE_TYPE_LABELS[selectedRequest.serviceType]?.label}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selectedRequest.name}</h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(selectedRequest.id)}
                                        className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5 text-white/60" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Contact Info */}
                            <div className="p-6 bg-white/5 border-b border-white/10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40">Email</p>
                                            <a href={`mailto:${selectedRequest.email}`} className="text-sm text-cyan-400 hover:underline">
                                                {selectedRequest.email}
                                            </a>
                                        </div>
                                    </div>
                                    {selectedRequest.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/40">Téléphone</p>
                                                <a href={`tel:${selectedRequest.phone}`} className="text-sm text-white">
                                                    {selectedRequest.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {selectedRequest.company && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                                <Building className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/40">Entreprise</p>
                                                <p className="text-sm text-white">{selectedRequest.company}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/40">Date</p>
                                            <p className="text-sm text-white">
                                                {formatDistanceToNow(new Date(selectedRequest.createdAt), { addSuffix: true, locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Info */}
                            <div className="p-6 border-b border-white/10">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {selectedRequest.budget && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                                                <DollarSign className="w-4 h-4" />
                                                Budget
                                            </div>
                                            <p className="text-white font-medium">{selectedRequest.budget}</p>
                                        </div>
                                    )}
                                    {selectedRequest.deadline && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                            <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                                                <Clock className="w-4 h-4" />
                                                Délai
                                            </div>
                                            <p className="text-white font-medium">{selectedRequest.deadline}</p>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Description du projet
                                </h3>
                                <div className="bg-white/5 rounded-xl p-5 text-white/80 whitespace-pre-wrap leading-relaxed border border-white/10">
                                    {selectedRequest.description}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div className="p-6">
                                <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Notes internes
                                </h3>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-white placeholder-white/30"
                                    placeholder="Ajouter des notes..."
                                />
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={isUpdating}
                                    className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                                >
                                    Sauvegarder les notes
                                </button>
                            </div>
                        </div>

                        {/* Status Actions */}
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <p className="text-xs text-white/40 mb-3">Changer le statut :</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'NEW', label: 'Nouveau', icon: '📬', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30' },
                                    { value: 'CONTACTED', label: 'Contacté', icon: '📞', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30' },
                                    { value: 'IN_PROGRESS', label: 'En cours', icon: '⏳', color: 'bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30' },
                                    { value: 'COMPLETED', label: 'Terminé', icon: '✅', color: 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30' },
                                    { value: 'CANCELLED', label: 'Annulé', icon: '❌', color: 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' },
                                ].map((status) => (
                                    <button
                                        key={status.value}
                                        onClick={() => handleUpdateStatus(selectedRequest.id, status.value)}
                                        disabled={isUpdating}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 disabled:opacity-50 ${selectedRequest.status === status.value
                                                ? `${status.color} ring-2 ring-offset-1 ring-offset-slate-900`
                                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'
                                            }`}
                                    >
                                        <span>{status.icon}</span>
                                        {status.label}
                                        {selectedRequest.status === status.value && (
                                            <CheckCircle className="w-3 h-3 ml-0.5" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
