"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    AlertTriangle,
    Star,
    Eye,
    Shield,
    Ban,
    BadgeCheck,
    BadgeX,
    Clock,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    MessageSquare,
    Heart,
    ArrowLeft,
    Loader2,
    AlertCircle,
    FileWarning,
    Package
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserData {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    avatar: string | null;
    city: string | null;
    role: string;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'TRUSTED' | 'REJECTED';
    isTrusted: boolean;
    rejectionReason: string | null;
    isBanned: boolean;
    banReason: string | null;
    bannedAt: string | null;
    createdAt: string;
    updatedAt: string;
    ads: Array<{
        id: string;
        title: string;
        price: number;
        status: string;
        moderationStatus: string;
        rejectionReason: string | null;
        location: string;
        images: string[];
        views: number;
        createdAt: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    reportsSent: Array<{
        id: string;
        reason: string;
        details: string | null;
        status: string;
        createdAt: string;
        ad: { id: string; title: string } | null;
        reportedUser: { id: string; name: string; email: string } | null;
    }>;
    reportsReceived: Array<{
        id: string;
        reason: string;
        details: string | null;
        status: string;
        createdAt: string;
        ad: { id: string; title: string } | null;
        reporter: { id: string; name: string; email: string };
    }>;
    favorites: Array<{
        id: string;
        createdAt: string;
        ad: { id: string; title: string; price: number; images: string[] };
    }>;
    receivedReviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: string;
        author: { id: string; name: string | null; avatar: string | null };
    }>;
    sentReviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: string;
        receiver: { id: string; name: string | null };
    }>;
    _count: {
        conversations: number;
        messages: number;
    };
}

interface Stats {
    totalAds: number;
    activeAds: number;
    pendingAds: number;
    rejectedAds: number;
    totalViews: number;
    totalReportsSent: number;
    totalReportsReceived: number;
    pendingReportsReceived: number;
    averageRating: string | null;
    totalReviewsReceived: number;
}

export default function AdminSearchPage() {
    const [searchId, setSearchId] = useState('');
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Sections collapsibles
    const [expandedSections, setExpandedSections] = useState({
        ads: true,
        reportsReceived: true,
        reportsSent: false,
        favorites: false,
        reviews: false,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedId = searchId.trim();

        if (!trimmedId) {
            setError('Veuillez entrer un ID utilisateur');
            return;
        }

        setLoading(true);
        setError(null);
        setUser(null);
        setStats(null);

        try {
            const res = await fetch(`/api/admin/users/${trimmedId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la recherche');
            }

            setUser(data.user);
            setStats(data.stats);
        } catch (err: any) {
            setError(err.message || 'Utilisateur non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyId = async (id: string) => {
        try {
            await navigator.clipboard.writeText(id);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'TRUSTED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <Star className="w-3 h-3 fill-emerald-400" />
                        Confiance
                    </span>
                );
            case 'VERIFIED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <BadgeCheck className="w-3 h-3" />
                        Vérifié
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        <BadgeX className="w-3 h-3" />
                        Rejeté
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/50 border border-white/10">
                        <Clock className="w-3 h-3" />
                        En attente
                    </span>
                );
        }
    };

    const getModerationBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">Approuvée</span>;
            case 'REJECTED':
                return <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Rejetée</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">En attente</span>;
        }
    };

    const getReportStatusBadge = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">Résolu</span>;
            case 'REJECTED':
                return <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">Rejeté</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">En attente</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        Recherche Utilisateur
                    </h1>
                    <p className="text-white/60 mt-1">
                        Recherchez un utilisateur par son ID pour voir tous ses détails
                    </p>
                </div>
                <Link
                    href="/admin/users"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux utilisateurs
                </Link>
            </div>

            {/* Search Form */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="Entrez l'ID utilisateur (ex: clxxxx...)"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Recherche...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Rechercher
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error State */}
            {error && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-red-400 font-medium">Erreur</h3>
                        <p className="text-red-400/80">{error}</p>
                    </div>
                </div>
            )}

            {/* User Details */}
            {user && stats && (
                <div className="space-y-6">
                    {/* User Profile Card */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        {/* Banner si banni */}
                        {user.isBanned && (
                            <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3 flex items-center gap-3">
                                <Ban className="w-5 h-5 text-red-400" />
                                <div>
                                    <span className="text-red-400 font-medium">Compte banni</span>
                                    {user.banReason && (
                                        <span className="text-red-400/80 ml-2">- {user.banReason}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Avatar & Basic Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white/10">
                                        <Image
                                            src={user.avatar || "/user.png"}
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h2 className="text-2xl font-bold text-white">
                                                {user.name || 'Utilisateur'}
                                            </h2>
                                            {getStatusBadge(user.verificationStatus)}
                                            {user.role === 'ADMIN' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            )}
                                        </div>

                                        {/* ID avec copie */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-white/40 text-sm font-mono bg-white/5 px-3 py-1 rounded-lg">
                                                ID: {user.id}
                                            </span>
                                            <button
                                                onClick={() => handleCopyId(user.id)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                                                title="Copier l'ID"
                                            >
                                                {copiedId === user.id ? (
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-white/40 hover:text-cyan-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-white/70">
                                        <Mail className="w-4 h-4 text-white/40" />
                                        <span>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-3 text-white/70">
                                            <Phone className="w-4 h-4 text-white/40" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.city && (
                                        <div className="flex items-center gap-3 text-white/70">
                                            <MapPin className="w-4 h-4 text-white/40" />
                                            <span>{user.city}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-white/70">
                                        <Calendar className="w-4 h-4 text-white/40" />
                                        <span>Inscrit {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: fr })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            {user.verificationStatus === 'REJECTED' && user.rejectionReason && (
                                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-red-400 text-sm">
                                        <strong>Raison du rejet :</strong> {user.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.totalAds}</div>
                            <div className="text-white/50 text-xs">Annonces</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
                            <div className="text-white/50 text-xs">Vues totales</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.totalReportsReceived}</div>
                            <div className="text-white/50 text-xs">Signalements reçus</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{stats.averageRating || '-'}</div>
                            <div className="text-white/50 text-xs">Note moyenne</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <MessageSquare className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{user._count.conversations}</div>
                            <div className="text-white/50 text-xs">Conversations</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-white">{user.favorites.length}</div>
                            <div className="text-white/50 text-xs">Favoris</div>
                        </div>
                    </div>

                    {/* Ads Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => toggleSection('ads')}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Annonces ({stats.totalAds})
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">{stats.activeAds} actives</span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">{stats.pendingAds} en attente</span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">{stats.rejectedAds} rejetées</span>
                                </div>
                            </div>
                            {expandedSections.ads ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                        </button>
                        {expandedSections.ads && (
                            <div className="border-t border-white/10">
                                {user.ads.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {user.ads.map((ad) => (
                                            <div key={ad.id} className="p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                                                        {ad.images[0] ? (
                                                            <Image
                                                                src={ad.images[0]}
                                                                alt=""
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-cover"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-white/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-white font-medium truncate">{ad.title}</h4>
                                                            {getModerationBadge(ad.moderationStatus)}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 text-sm text-white/50">
                                                            <span className="text-cyan-400 font-semibold">{ad.price.toLocaleString()} DA</span>
                                                            <span>{ad.category.name}</span>
                                                            <span>{ad.location}</span>
                                                            <span className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" />
                                                                {ad.views}
                                                            </span>
                                                        </div>
                                                        {ad.moderationStatus === 'REJECTED' && ad.rejectionReason && (
                                                            <p className="text-red-400/80 text-xs mt-1">Raison: {ad.rejectionReason}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleCopyId(ad.id)}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-cyan-400"
                                                            title="Copier l'ID de l'annonce"
                                                        >
                                                            {copiedId === ad.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                        <Link
                                                            href={`/annonces/${ad.id}`}
                                                            target="_blank"
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-cyan-400"
                                                            title="Voir l'annonce"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        Aucune annonce
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reports Received Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => toggleSection('reportsReceived')}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Signalements reçus ({stats.totalReportsReceived})
                                </h3>
                                {stats.pendingReportsReceived > 0 && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-red-500 text-white animate-pulse">
                                        {stats.pendingReportsReceived} en attente
                                    </span>
                                )}
                            </div>
                            {expandedSections.reportsReceived ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                        </button>
                        {expandedSections.reportsReceived && (
                            <div className="border-t border-white/10">
                                {user.reportsReceived.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {user.reportsReceived.map((report) => (
                                            <div key={report.id} className="p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                        <FileWarning className="w-5 h-5 text-amber-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-white font-medium">{report.reason}</span>
                                                            {getReportStatusBadge(report.status)}
                                                        </div>
                                                        {report.details && (
                                                            <p className="text-white/60 text-sm mt-1">{report.details}</p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                                                            <span>Par: {report.reporter.name || report.reporter.email}</span>
                                                            {report.ad && <span>Annonce: {report.ad.title}</span>}
                                                            <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: fr })}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopyId(report.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-cyan-400 flex-shrink-0"
                                                        title="Copier l'ID du signalement"
                                                    >
                                                        {copiedId === report.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        Aucun signalement reçu
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reports Sent Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => toggleSection('reportsSent')}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileWarning className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Signalements envoyés ({stats.totalReportsSent})
                                </h3>
                            </div>
                            {expandedSections.reportsSent ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                        </button>
                        {expandedSections.reportsSent && (
                            <div className="border-t border-white/10">
                                {user.reportsSent.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {user.reportsSent.map((report) => (
                                            <div key={report.id} className="p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                        <FileWarning className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-white font-medium">{report.reason}</span>
                                                            {getReportStatusBadge(report.status)}
                                                        </div>
                                                        {report.details && (
                                                            <p className="text-white/60 text-sm mt-1">{report.details}</p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                                                            {report.reportedUser && (
                                                                <span>Contre: {report.reportedUser.name || report.reportedUser.email}</span>
                                                            )}
                                                            {report.ad && <span>Annonce: {report.ad.title}</span>}
                                                            <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: fr })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        Aucun signalement envoyé
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => toggleSection('reviews')}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Avis reçus ({stats.totalReviewsReceived})
                                </h3>
                                {stats.averageRating && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                                        <Star className="w-3 h-3 fill-yellow-400" />
                                        {stats.averageRating}/5
                                    </span>
                                )}
                            </div>
                            {expandedSections.reviews ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                        </button>
                        {expandedSections.reviews && (
                            <div className="border-t border-white/10">
                                {user.receivedReviews.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {user.receivedReviews.map((review) => (
                                            <div key={review.id} className="p-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={review.author.avatar || "/user.png"}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="w-full h-full object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">{review.author.name || 'Utilisateur'}</span>
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-white/70 text-sm mt-1">{review.comment}</p>
                                                        )}
                                                        <span className="text-white/40 text-xs mt-2 block">
                                                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: fr })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        Aucun avis reçu
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Favorites Section */}
                    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                        <button
                            onClick={() => toggleSection('favorites')}
                            className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-pink-400" />
                                <h3 className="text-lg font-semibold text-white">
                                    Favoris ({user.favorites.length})
                                </h3>
                            </div>
                            {expandedSections.favorites ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                        </button>
                        {expandedSections.favorites && (
                            <div className="border-t border-white/10">
                                {user.favorites.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                                        {user.favorites.map((fav) => (
                                            <Link
                                                key={fav.id}
                                                href={`/annonces/${fav.ad.id}`}
                                                target="_blank"
                                                className="rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                            >
                                                <div className="aspect-square relative">
                                                    {fav.ad.images[0] ? (
                                                        <Image
                                                            src={fav.ad.images[0]}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                            <Package className="w-8 h-8 text-white/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="text-white text-sm font-medium truncate">{fav.ad.title}</h4>
                                                    <p className="text-cyan-400 text-sm font-semibold">{fav.ad.price.toLocaleString()} DA</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-white/40">
                                        Aucun favori
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && !user && (
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                        <Search className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Recherchez un utilisateur</h3>
                    <p className="text-white/50 max-w-md mx-auto">
                        Entrez l'ID d'un utilisateur pour voir toutes ses informations : profil, annonces, signalements, avis et favoris.
                    </p>
                </div>
            )}
        </div>
    );
}
