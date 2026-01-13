"use client";

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft,
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    ShoppingBag,
    Eye,
    Heart,
    MapPin,
    Tag,
    Calendar,
    BarChart3,
    PieChart as PieChartIcon,
    RefreshCw,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    Star,
    Award,
    AlertTriangle,
} from 'lucide-react';
import {
    TimelineChart,
    MultiLineChart,
    SimpleBarChart,
    DonutChart,
    CHART_COLORS,
} from '@/components/admin/charts';
import { downloadCSV, EXPORT_HEADERS } from '@/lib/export-csv';
import { getErrorMessage } from '@/lib/errors';

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

// Composant de tableau interactif
interface DataTableProps {
    title: string;
    columns: { key: string; label: string; format?: (value: any) => string }[];
    data: any[];
    onExport?: () => void;
    emptyMessage?: string;
}

function DataTable({ title, columns, data, onExport, emptyMessage = "Aucune donnée" }: DataTableProps) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortAsc, setSortAsc] = useState(true);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortAsc ? aVal - bVal : bVal - aVal;
        }
        return sortAsc
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal));
    });

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold">{title}</h3>
                {onExport && (
                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exporter
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {sortKey === col.key && (
                                            <ChevronDown className={`w-3 h-3 transition-transform ${!sortAsc ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3 text-sm text-white/80">
                                            {col.format ? col.format(row[col.key]) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Card statistique avec comparaison
function StatComparison({
    label,
    current,
    previous,
    format = (v: number) => v.toLocaleString('fr-FR'),
}: {
    label: string;
    current: number;
    previous: number;
    format?: (v: number) => string;
}) {
    const diff = current - previous;
    const percent = previous > 0 ? Math.round((diff / previous) * 100) : current > 0 ? 100 : 0;
    const isPositive = diff >= 0;

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/50 text-xs mb-1">{label}</p>
            <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{format(current)}</p>
                <div className={`flex items-center gap-0.5 text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{percent}%
                </div>
            </div>
            <p className="text-white/30 text-xs mt-1">vs période précédente: {format(previous)}</p>
        </div>
    );
}

export default function AnalyticsPage() {
    const [days, setDays] = useState(30);

    // Stats enrichies
    const { data: statsData, error: statsError, mutate: mutateStats } = useSWR('/api/admin/stats', {
        refreshInterval: 120000,
    });

    // Timelines
    const { data: usersTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=users&days=${days}`,
        { refreshInterval: 300000 }
    );
    const { data: adsTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=ads&days=${days}`,
        { refreshInterval: 300000 }
    );
    const { data: messagesTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=messages&days=${days}`,
        { refreshInterval: 300000 }
    );
    const { data: favoritesTimelineData } = useSWR(
        `/api/admin/stats/timeline?metric=favorites&days=${days}`,
        { refreshInterval: 300000 }
    );

    // Distributions
    const { data: distributionData, error: distributionError } = useSWR('/api/admin/stats/distribution?type=all', {
        refreshInterval: 300000,
    });

    const isLoading = (!statsData && !statsError) || (!distributionData && !distributionError);

    if (statsError || distributionError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 bg-red-500/10 border border-red-500/20 rounded-2xl mx-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Une erreur est survenue lors du chargement des analyses</h2>
                    <p className="text-white/60 mb-4">{getErrorMessage(statsError || distributionError)}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-white/40 animate-pulse text-sm">Chargement des analyses détaillées...</p>
            </div>
        );
    }

    const stats = statsData?.data;
    const distributions = distributionData?.data;

    // Timelines
    const usersTimeline = usersTimelineData?.data?.timeline || [];
    const adsTimeline = adsTimelineData?.data?.timeline || [];
    const messagesTimeline = messagesTimelineData?.data?.timeline || [];
    const favoritesTimeline = favoritesTimelineData?.data?.timeline || [];

    // Calcul des totaux sur la période
    const totalNewUsers = usersTimeline.reduce((sum: number, d: any) => sum + d.count, 0);
    const totalNewAds = adsTimeline.reduce((sum: number, d: any) => sum + d.count, 0);
    const totalMessages = messagesTimeline.reduce((sum: number, d: any) => sum + d.count, 0);
    const totalFavorites = favoritesTimeline.reduce((sum: number, d: any) => sum + d.count, 0);

    // Données combinées pour le multi-line chart
    const combinedEngagementData = usersTimeline.map((u: any, i: number) => ({
        label: u.label,
        users: u.count,
        ads: adsTimeline[i]?.count || 0,
    }));

    // Préparation données exports
    const handleExportTimeline = (metric: string, data: any[]) => {
        downloadCSV(data, `analytics_${metric}_${days}j`, EXPORT_HEADERS.timeline);
    };

    const handleExportCategories = () => {
        const data = distributions.ads?.byCategory || [];
        downloadCSV(data, 'analytics_categories', EXPORT_HEADERS.categories);
    };

    const handleExportLocations = () => {
        const data = distributions.ads?.byLocation || [];
        downloadCSV(data, 'analytics_locations', EXPORT_HEADERS.locations);
    };

    // Top annonces
    const topViewedAds = distributions.ads?.topViewed || [];
    const topFavoritedAds = distributions.ads?.topFavorited || [];

    // Top créateurs
    const topCreators = distributions.users?.topCreators || [];

    // Données pour les graphiques
    const categoryData = (distributions.ads?.byCategory || []).slice(0, 10).map((c: any, i: number) => ({
        name: c.subcategoryName || c.categoryName,
        value: c.count,
        color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
    }));

    const locationData = (distributions.ads?.byLocation || []).slice(0, 10).map((l: any, i: number) => ({
        name: l.location,
        value: l.count,
        color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
    }));

    const cityDistributionUsers = (distributions.users?.byCity || []).slice(0, 8).map((c: any, i: number) => ({
        name: c.city,
        value: c.count,
        color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
    }));

    // Reports distribution
    const reportsByReason = (distributions.reports?.byReason || []).map((r: any, i: number) => ({
        name: r.reason,
        value: r.count,
        color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
    }));

    // Support distribution
    const ticketsByCategory = (distributions.support?.byCategory || []).map((t: any, i: number) => ({
        name: t.category.replace('_', ' '),
        value: t.count,
        color: CHART_COLORS.palette[i % CHART_COLORS.palette.length],
    }));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/sl-panel-9x7k"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Analytics détaillées</h1>
                        <p className="text-white/50 text-sm">Analyse approfondie des performances</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => mutateStats()}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        title="Actualiser"
                    >
                        <RefreshCw className="w-4 h-4 text-white/60" />
                    </button>
                    <PeriodSelector value={days} onChange={setDays} />
                </div>
            </div>

            {/* KPIs sur la période */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-white/60 text-sm">Nouveaux utilisateurs</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalNewUsers}</p>
                    <p className="text-white/40 text-xs mt-1">sur {days} jours</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <ShoppingBag className="w-5 h-5 text-emerald-400" />
                        <span className="text-white/60 text-sm">Nouvelles annonces</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalNewAds}</p>
                    <p className="text-white/40 text-xs mt-1">sur {days} jours</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <span className="text-white/60 text-sm">Favoris ajoutés</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalFavorites}</p>
                    <p className="text-white/40 text-xs mt-1">sur {days} jours</p>
                </div>
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-5 h-5 text-amber-400" />
                        <span className="text-white/60 text-sm">Vues totales</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.ads.totalViews.toLocaleString('fr-FR')}</p>
                    <p className="text-white/40 text-xs mt-1">toutes annonces</p>
                </div>
            </div>

            {/* Graphique multi-séries Utilisateurs vs Annonces */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Croissance comparée</h2>
                            <p className="text-white/40 text-sm">Utilisateurs vs Annonces sur {days} jours</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const combined = usersTimeline.map((u: any, i: number) => ({
                                date: u.date,
                                label: u.label,
                                users: u.count,
                                ads: adsTimeline[i]?.count || 0,
                            }));
                            downloadCSV(combined, `croissance_${days}j`, [
                                { key: 'date', label: 'Date' },
                                { key: 'label', label: 'Jour' },
                                { key: 'users', label: 'Utilisateurs' },
                                { key: 'ads', label: 'Annonces' },
                            ]);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exporter
                    </button>
                </div>
                <MultiLineChart
                    data={combinedEngagementData}
                    lines={[
                        { dataKey: 'users', name: 'Utilisateurs', color: CHART_COLORS.primary },
                        { dataKey: 'ads', name: 'Annonces', color: CHART_COLORS.secondary },
                    ]}
                    height={320}
                />
            </div>

            {/* Distributions par catégorie et ville */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Par catégorie */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <Tag className="w-4 h-4 text-cyan-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Par catégorie</h2>
                        </div>
                        <button
                            onClick={handleExportCategories}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Exporter"
                        >
                            <Download className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                    {categoryData.length > 0 ? (
                        <SimpleBarChart data={categoryData} height={300} layout="horizontal" />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-white/40">Aucune donnée</div>
                    )}
                </div>

                {/* Par ville */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-teal-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Par ville</h2>
                        </div>
                        <button
                            onClick={handleExportLocations}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Exporter"
                        >
                            <Download className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                    {locationData.length > 0 ? (
                        <SimpleBarChart data={locationData} height={300} layout="horizontal" />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-white/40">Aucune donnée</div>
                    )}
                </div>
            </div>

            {/* Graphiques d'engagement */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Messages */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Messages échangés</h2>
                        <button
                            onClick={() => handleExportTimeline('messages', messagesTimeline)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Download className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                    <TimelineChart
                        data={messagesTimeline}
                        color={CHART_COLORS.accent}
                        height={220}
                        showArea={true}
                    />
                </div>

                {/* Favoris */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Favoris ajoutés</h2>
                        <button
                            onClick={() => handleExportTimeline('favorites', favoritesTimeline)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <Download className="w-4 h-4 text-white/40" />
                        </button>
                    </div>
                    <TimelineChart
                        data={favoritesTimeline}
                        color="#ec4899"
                        height={220}
                        showArea={true}
                    />
                </div>
            </div>

            {/* Distributions donuts */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Utilisateurs par ville */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Utilisateurs par ville</h2>
                    {cityDistributionUsers.length > 0 ? (
                        <DonutChart
                            data={cityDistributionUsers}
                            height={200}
                            centerValue={stats.users.total}
                            centerLabel="Total"
                        />
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-white/40">Aucune donnée</div>
                    )}
                </div>

                {/* Signalements par raison */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Signalements par raison</h2>
                    {reportsByReason.length > 0 ? (
                        <DonutChart data={reportsByReason} height={200} />
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-white/40">Aucun signalement</div>
                    )}
                </div>

                {/* Tickets par catégorie */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Tickets par catégorie</h2>
                    {ticketsByCategory.length > 0 ? (
                        <DonutChart data={ticketsByCategory} height={200} />
                    ) : (
                        <div className="h-[200px] flex items-center justify-center text-white/40">Aucun ticket</div>
                    )}
                </div>
            </div>

            {/* Top Performances */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Top annonces vues */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-purple-400" />
                        <h2 className="text-white font-semibold">Top annonces (vues)</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {topViewedAds.length === 0 ? (
                            <div className="p-6 text-center text-white/40">Aucune donnée</div>
                        ) : (
                            topViewedAds.map((ad: any, i: number) => (
                                <div key={ad.id} className="p-3 flex items-center gap-3 hover:bg-white/5">
                                    <span className="text-white/30 text-sm font-medium w-6">#{i + 1}</span>
                                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                                        {ad.image && (
                                            <Image src={ad.image} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{ad.title}</p>
                                        <p className="text-white/40 text-xs">{ad.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-purple-400 font-semibold">{ad.views.toLocaleString()}</p>
                                        <p className="text-white/30 text-xs">vues</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top annonces favorisées */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <h2 className="text-white font-semibold">Top annonces (favoris)</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {topFavoritedAds.length === 0 ? (
                            <div className="p-6 text-center text-white/40">Aucune donnée</div>
                        ) : (
                            topFavoritedAds.map((ad: any, i: number) => (
                                <div key={ad.id} className="p-3 flex items-center gap-3 hover:bg-white/5">
                                    <span className="text-white/30 text-sm font-medium w-6">#{i + 1}</span>
                                    <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
                                        {ad.image && (
                                            <Image src={ad.image} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{ad.title}</p>
                                        <p className="text-white/40 text-xs">{ad.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-pink-400 font-semibold">{ad.favoritesCount}</p>
                                        <p className="text-white/30 text-xs">favoris</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top créateurs */}
                <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h2 className="text-white font-semibold">Top créateurs</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {topCreators.length === 0 ? (
                            <div className="p-6 text-center text-white/40">Aucune donnée</div>
                        ) : (
                            topCreators.map((user: any, i: number) => (
                                <div key={user.id} className="p-3 flex items-center gap-3 hover:bg-white/5">
                                    <span className="text-white/30 text-sm font-medium w-6">#{i + 1}</span>
                                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                        <Image src={user.avatar || '/user.png'} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{user.name || 'Utilisateur'}</p>
                                        <p className="text-white/40 text-xs capitalize">{user.verificationStatus?.toLowerCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-amber-400 font-semibold">{user.adsCount}</p>
                                        <p className="text-white/30 text-xs">annonces</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


