import { AdminService } from '@/services';
import {
    Users,
    ShoppingBag,
    AlertTriangle,
    TrendingUp,
    UserPlus,
    Package,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
    const [stats, activity] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getRecentActivity(),
    ]);
    return { stats, activity };
}

export default async function AdminDashboardPage() {
    const { stats, activity } = await getDashboardData();

    const statCards = [
        {
            title: 'Utilisateurs',
            value: stats.totalUsers,
            change: `+${stats.newUsersThisMonth} ce mois`,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            href: '/admin/users',
        },
        {
            title: 'Annonces actives',
            value: stats.activeAds,
            change: `${stats.totalAds} au total`,
            icon: ShoppingBag,
            color: 'from-emerald-500 to-teal-500',
            href: '/admin/ads',
        },
        {
            title: 'Signalements',
            value: stats.pendingReports,
            change: 'En attente',
            icon: AlertTriangle,
            color: stats.pendingReports > 0 ? 'from-red-500 to-orange-500' : 'from-gray-500 to-gray-600',
            href: '/admin/reports',
        },
        {
            title: 'Catégories',
            value: stats.totalCategories,
            change: 'Actives',
            icon: Package,
            color: 'from-cyan-500 to-teal-500',
            href: '/admin/categories',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Tableau de bord
                </h1>
                <p className="text-white/60">
                    Bienvenue dans l&apos;espace d&apos;administration FemMarket
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {statCards.map((stat) => (
                    <Link
                        key={stat.title}
                        href={stat.href}
                        className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${stat.color} transition-opacity duration-300`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <TrendingUp className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-white/60 text-sm font-medium mb-1">
                                {stat.title}
                            </h3>
                            <p className="text-3xl font-bold text-white mb-1">
                                {stat.value.toLocaleString('fr-FR')}
                            </p>
                            <p className="text-sm text-white/40">
                                {stat.change}
                            </p>
                        </div>
                    </Link>
                ))}
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
                            <Link
                                href="/admin/users"
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentUsers.length === 0 ? (
                            <div className="p-6 text-center text-white/40">
                                Aucun utilisateur récent
                            </div>
                        ) : (
                            activity.recentUsers.map((user) => (
                                <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                            {user.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name || ''}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white font-bold text-sm">
                                                    {user.name?.charAt(0) || 'U'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {user.name || 'Utilisateur'}
                                            </p>
                                            <p className="text-white/40 text-xs truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-white/30 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(user.createdAt), {
                                                addSuffix: true,
                                                locale: fr
                                            })}
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
                            <Link
                                href="/admin/ads"
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentAds.length === 0 ? (
                            <div className="p-6 text-center text-white/40">
                                Aucune annonce récente
                            </div>
                        ) : (
                            activity.recentAds.map((ad) => (
                                <div key={ad.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                                            <ShoppingBag className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {ad.title}
                                            </p>
                                            <p className="text-emerald-400 text-xs font-semibold">
                                                {ad.price.toLocaleString('fr-FR')} DA
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white/40 text-xs">
                                                {ad.user.name}
                                            </p>
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
                            <Link
                                href="/admin/reports"
                                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Voir tout
                            </Link>
                        </div>
                    </div>
                    <div className="divide-y divide-white/5">
                        {activity.recentReports.length === 0 ? (
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <p className="text-white/60 text-sm">
                                    Aucun signalement en attente
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                    Tout est en ordre ! ✨
                                </p>
                            </div>
                        ) : (
                            activity.recentReports.map((report) => (
                                <div key={report.id} className="p-4 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">
                                                {report.reason}
                                            </p>
                                            <p className="text-white/40 text-xs">
                                                Par {report.reporter.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 text-white/30 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(report.createdAt), {
                                                addSuffix: true,
                                                locale: fr
                                            })}
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
                <h2 className="text-lg font-semibold text-white mb-4">
                    Actions rapides
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Link
                        href="/admin/users"
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">Gérer les utilisateurs</span>
                    </Link>
                    <Link
                        href="/admin/ads"
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">Modérer les annonces</span>
                    </Link>
                    <Link
                        href="/admin/reports"
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">Traiter les signalements</span>
                    </Link>
                    <Link
                        href="/admin/categories"
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white/80 text-sm font-medium">Gérer les catégories</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
