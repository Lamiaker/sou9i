"use client";

import { useState } from 'react';
import useSWR from 'swr';
import {
    Users,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    UserPlus,
    Package,
    Clock,
    Eye,
    Heart,
    MessageSquare,
    Star,
    Shield,
    CheckCircle,
    UserX,
    HeadphonesIcon,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    TimelineChart,
    MultiLineChart,
    SimpleBarChart,
    DonutChart,
    CHART_COLORS,
} from '@/components/admin/charts';
import { AlertsPanel, StatusIndicator } from '@/components/admin/AlertsPanel';
import { evaluateAlerts, ActiveAlert } from '@/lib/admin-alerts';

// Types pour les stats enrichies
interface EnhancedStats {
    users: {
        total: number;
        newThisMonth: number;
        newLast7Days: number;
        trend7Days: number;
        trendMonth: number;
        byStatus: {
            verified: number;
            trusted: number;
            pending: number;
            banned: number;
        };
        verificationRate: number;
    };
    ads: {
        total: number;
        active: number;
        pending: number;
        approved: number;
        rejected: number;
        newThisMonth: number;
        trendMonth: number;
        totalViews: number;
        approvalRate: number;
    };
    moderation: {
        pendingReports: number;
        resolvedThisMonth: number;
        openTickets: number;
        inProgressTickets: number;
        totalTicketsPending: number;
    };
    categories: {
        total: number;
        trending: number;
    };
    engagement: {
        totalFavorites: number;
        totalMessages: number;
        totalReviews: number;
        avgRating: number;
    };
}

interface Activity {
    recentUsers: any[];
    recentAds: any[];
    recentReports: any[];
}

// Composant pour afficher une tendance
function TrendBadge({ value, suffix = '%' }: { value: number; suffix?: string }) {
    if (value === 0) return null;
    const isPositive = value > 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
            {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
            ) : (
                <ArrowDownRight className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{value}{suffix}
        </span>
    );
}

// Sélecteur de période
function PeriodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const options = [
        { value: 7, label: '7 jours' },
        { value: 30, label: '30 jours' },
        { value: 90, label: '90 jours' },
    ];

    return (
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${value === opt.value
                        ? 'bg-cyan-500 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export default function AdminDashboardPage() {
    const [timelineDays, setTimelineDays] = useState(30);
    const [activeMetric, setActiveMetric] = useState<'users' | 'ads'>('users');

    // Stats enrichies
    const { data: statsData, error: statsError } = useSWR('/api/admin/stats', {
        refreshInterval: 180000 // 3 minutes au lieu de 1 minute
    });

    // Timeline data
    const { data: usersTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=users&days=${timelineDays}`,
        { refreshInterval: 600000 } // 10 minutes au lieu de 2 minutes
    );
    const { data: adsTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=ads&days=${timelineDays}`,
        { refreshInterval: 600000 } // 10 minutes au lieu de 2 minutes
    );

    // Distribution data (déjà 5min, parfait)
    const { data: distributionData } = useSWR(
        '/api/admin/stats/distribution?type=ads',
        { refreshInterval: 300000 }
    );

    // Alertes (signalements) - On garde une réactivité correcte
    const { data: alertsData } = useSWR('/api/admin/alerts', {
        refreshInterval: 45000 // 45s au lieu de 30s
    });

    // Activité récente
    const { data: dashboardData, error: dashboardError } = useSWR('/api/admin/dashboard', {
        refreshInterval: 45000 // 45s au lieu de 30s
    });

    const isLoading = (!statsData && !statsError) || (!dashboardData && !dashboardError);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const stats: EnhancedStats = statsData?.data || {
        users: { total: 0, newThisMonth: 0, newLast7Days: 0, trend7Days: 0, trendMonth: 0, byStatus: { verified: 0, trusted: 0, pending: 0, banned: 0 }, verificationRate: 0 },
        ads: { total: 0, active: 0, pending: 0, approved: 0, rejected: 0, newThisMonth: 0, trendMonth: 0, totalViews: 0, approvalRate: 0 },
        moderation: { pendingReports: 0, resolvedThisMonth: 0, openTickets: 0, inProgressTickets: 0, totalTicketsPending: 0 },
        categories: { total: 0, trending: 0 },
        engagement: { totalFavorites: 0, totalMessages: 0, totalReviews: 0, avgRating: 0 },
    };

    const activity: Activity = dashboardData?.data?.activity || { recentUsers: [], recentAds: [], recentReports: [] };

    // Données timeline
    const usersTimeline = usersTimelineData?.data?.timeline || [];
    const adsTimeline = adsTimelineData?.data?.timeline || [];

    // Données distribution
    const adsDistribution = distributionData?.data || { byCategory: [], byStatus: [], byModeration: [], byLocation: [] };

    // Cards principales
    const mainStatCards = [
        {
            title: 'Utilisateurs',
            value: stats.users.total,
            subtitle: `+${stats.users.newLast7Days} cette semaine`,
            trend: stats.users.trend7Days,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            href: '/admin/users',
        },
        {
            title: 'Annonces actives',
            value: stats.ads.active,
            subtitle: `${stats.ads.pending} en attente`,
            trend: stats.ads.trendMonth,
            icon: ShoppingBag,
            color: 'from-emerald-500 to-teal-500',
            href: '/admin/ads',
            alert: stats.ads.pending > 0,
        },
        {
            title: 'Signalements',
            value: stats.moderation.pendingReports,
            subtitle: stats.moderation.pendingReports > 0 ? 'À traiter' : 'Aucun',
            icon: AlertTriangle,
            color: stats.moderation.pendingReports > 0 ? 'from-red-500 to-orange-500' : 'from-gray-500 to-gray-600',
            href: '/admin/reports',
            alert: stats.moderation.pendingReports > 5,
        },
        {
            title: 'Support',
            value: stats.moderation.totalTicketsPending,
            subtitle: `${stats.moderation.openTickets} ouverts`,
            icon: HeadphonesIcon,
            color: stats.moderation.totalTicketsPending > 0 ? 'from-amber-500 to-orange-500' : 'from-gray-500 to-gray-600',
            href: '/admin/support',
        },
    ];

    // Cards engagement
    const engagementCards = [
        { title: 'Vues totales', value: stats.ads.totalViews, icon: Eye, color: 'text-purple-400' },
        { title: 'Favoris', value: stats.engagement.totalFavorites, icon: Heart, color: 'text-red-400' },
        { title: 'Messages', value: stats.engagement.totalMessages, icon: MessageSquare, color: 'text-blue-400' },
        { title: 'Note moyenne', value: stats.engagement.avgRating > 0 ? `${stats.engagement.avgRating}/5` : '-', icon: Star, color: 'text-yellow-400' },
    ];

    // Données pour les donuts
    const userStatusData = [
        { name: 'Vérifiés', value: stats.users.byStatus.verified, color: CHART_COLORS.verified },
        { name: 'Confiance', value: stats.users.byStatus.trusted, color: CHART_COLORS.trusted },
        { name: 'En attente', value: stats.users.byStatus.pending, color: CHART_COLORS.pending },
        { name: 'Bannis', value: stats.users.byStatus.banned, color: CHART_COLORS.banned },
    ].filter(d => d.value > 0);

    const adModerationData = [
        { name: 'Approuvées', value: stats.ads.approved, color: CHART_COLORS.approved },
        { name: 'En attente', value: stats.ads.pending, color: CHART_COLORS.pending },
        { name: 'Rejetées', value: stats.ads.rejected, color: CHART_COLORS.danger },
    ].filter(d => d.value > 0);

    // Données pour le bar chart catégories (top 8)
    const categoryData = (adsDistribution.byCategory || [])
        .slice(0, 8)
        .map((c: any, i: number) => ({
            name: c.subcategoryName || c.categoryName,
            value: c.count,
            color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
        }));

    // Données pour le bar chart localisation (top 8)
    const locationData = (adsDistribution.byLocation || [])
        .slice(0, 8)
        .map((l: any, i: number) => ({
            name: l.location,
            value: l.count,
            color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
        }));

    // Combiner les timelines pour le multi-line chart
    const combinedTimeline = usersTimeline.map((u: any, i: number) => ({
        ...u,
        users: u.count,
        ads: adsTimeline[i]?.count || 0,
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                            Tableau de bord
                        </h1>
                        <StatusIndicator alerts={alertsData?.data?.alerts || []} />
                    </div>
                    <p className="text-white/60">
                        Bienvenue dans l'espace d'administration SweetLook
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/analytics"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 rounded-lg transition-all"
                    >
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                    </Link>
                    <PeriodSelector value={timelineDays} onChange={setTimelineDays} />
                </div>
            </div>

            {/* Panneau d'alertes */}
            {alertsData?.data?.alerts && alertsData.data.alerts.length > 0 && (
                <AlertsPanel alerts={alertsData.data.alerts} />
            )}

            {/* Stats principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {mainStatCards.map((stat) => (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${stat.alert ? 'border-red-500/50' : 'border-white/10'
                            }`}
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${stat.color} transition-opacity duration-300`} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                {stat.trend !== undefined && <TrendBadge value={stat.trend} />}
                            </div>
                            <h3 className="text-white/60 text-sm font-medium mb-1">{stat.title}</h3>
                            <p className="text-3xl font-bold text-white mb-1">
                                {typeof stat.value === 'number' ? stat.value.toLocaleString('fr-FR') : stat.value}
                            </p>
                            <p className="text-sm text-white/40">{stat.subtitle}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Graphique d'évolution principal */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Évolution de l'activité</h2>
                            <p className="text-white/40 text-sm">Inscriptions et annonces sur {timelineDays} jours</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveMetric('users')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'users'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            Utilisateurs
                        </button>
                        <button
                            onClick={() => setActiveMetric('ads')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'ads'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'text-white/50 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <ShoppingBag className="w-3.5 h-3.5 inline mr-1" />
                            Annonces
                        </button>
                    </div>
                </div>

                {activeMetric === 'users' ? (
                    <TimelineChart
                        data={usersTimeline}
                        color={CHART_COLORS.primary}
                        height={280}
                        showArea={true}
                    />
                ) : (
                    <TimelineChart
                        data={adsTimeline}
                        color={CHART_COLORS.secondary}
                        height={280}
                        showArea={true}
                    />
                )}
            </div>

            {/* Distributions & Analytics */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Donut Utilisateurs */}
                <div className="lg:col-span-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Statut utilisateurs</h2>
                    </div>
                    {userStatusData.length > 0 ? (
                        <DonutChart
                            data={userStatusData}
                            height={220}
                            centerValue={stats.users.total}
                            centerLabel="Total"
                        />
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-white/40">
                            Aucune donnée
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Taux de vérification</span>
                            <span className="text-white font-semibold">{stats.users.verificationRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Donut Annonces */}
                <div className="lg:col-span-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Modération annonces</h2>
                    </div>
                    {adModerationData.length > 0 ? (
                        <DonutChart
                            data={adModerationData}
                            height={220}
                            centerValue={stats.ads.total}
                            centerLabel="Total"
                        />
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-white/40">
                            Aucune donnée
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Taux d'approbation</span>
                            <span className="text-white font-semibold">{stats.ads.approvalRate}%</span>
                        </div>
                    </div>
                </div>

                {/* Engagement Cards */}
                <div className="lg:col-span-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-white">Engagement</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {engagementCards.map((card) => (
                            <div key={card.title} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
                                <p className="text-xl font-bold text-white">
                                    {typeof card.value === 'number' ? card.value.toLocaleString('fr-FR') : card.value}
                                </p>
                                <p className="text-xs text-white/40">{card.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bar Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Par catégorie */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Par catégorie</h2>
                            <p className="text-white/40 text-xs">Top 8 catégories</p>
                        </div>
                    </div>
                    {categoryData.length > 0 ? (
                        <SimpleBarChart
                            data={categoryData}
                            height={280}
                            layout="horizontal"
                        />
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-white/40">
                            Aucune donnée
                        </div>
                    )}
                </div>

                {/* Par localisation */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Par ville</h2>
                            <p className="text-white/40 text-xs">Top 8 localisations</p>
                        </div>
                    </div>
                    {locationData.length > 0 ? (
                        <SimpleBarChart
                            data={locationData}
                            height={280}
                            layout="horizontal"
                        />
                    ) : (
                        <div className="h-[280px] flex items-center justify-center text-white/40">
                            Aucune donnée
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                                Nouveaux utilisateurs
                            </h2>
                            <Link href="/admin/users" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentUsers.length === 0 ? (
                            <div className="p-6 text-center text-white/40">Aucun utilisateur récent</div>
                        ) : (
                            activity.recentUsers.map((user: any) => (
                                <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                            <Image src={user.avatar || "/user.png"} alt={user.name || ''} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{user.name || 'Utilisateur'}</p>
                                            <p className="text-white/40 text-xs truncate">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-white/30 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Ads */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                Dernières annonces
                            </h2>
                            <Link href="/admin/ads" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentAds.length === 0 ? (
                            <div className="p-6 text-center text-white/40">Aucune annonce récente</div>
                        ) : (
                            activity.recentAds.map((ad: any) => (
                                <div key={ad.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative border border-white/10">
                                            {ad.images && ad.images[0] ? (
                                                <Image src={ad.images[0]} alt={ad.title} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                            ) : (
                                                <ShoppingBag className="w-5 h-5 text-white/40" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{ad.title}</p>
                                            <p className="text-emerald-400 text-xs font-semibold">{ad.price.toLocaleString('fr-FR')} DA</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/40 text-xs">{ad.user.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Reports */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                Signalements en attente
                            </h2>
                            <Link href="/admin/reports" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentReports.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <p className="text-white/60 text-sm">Aucun signalement en attente</p>
                                <p className="text-white/40 text-xs mt-1">Tout est en ordre ! ✨</p>
                            </div>
                        ) : (
                            activity.recentReports.map((report: any) => (
                                <div key={report.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{report.reason}</p>
                                            <p className="text-white/40 text-xs">Par {report.reporter.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-white/30 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Actions rapides</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Link href="/admin/users?status=PENDING" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Valider utilisateurs</span>
                        {stats.users.byStatus.pending > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">{stats.users.byStatus.pending}</span>
                        )}
                    </Link>
                    <Link href="/admin/ads?moderationStatus=PENDING" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Modérer annonces</span>
                        {stats.ads.pending > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">{stats.ads.pending}</span>
                        )}
                    </Link>
                    <Link href="/admin/reports" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Signalements</span>
                        {stats.moderation.pendingReports > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{stats.moderation.pendingReports}</span>
                        )}
                    </Link>
                    <Link href="/admin/support" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <HeadphonesIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Support</span>
                        {stats.moderation.totalTicketsPending > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full">{stats.moderation.totalTicketsPending}</span>
                        )}
                    </Link>
                    <Link href="/admin/categories" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Catégories</span>
                    </Link>
                    <Link href="/admin/users?status=BANNED" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                            <UserX className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium text-center">Utilisateurs bannis</span>
                        {stats.users.byStatus.banned > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full">{stats.users.byStatus.banned}</span>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}
