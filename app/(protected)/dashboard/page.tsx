"use client";

import { useEffect, useState } from 'react';
import { ShoppingBag, Eye, MessageCircle, Heart, Clock, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';

interface UserProfile {
    id: string;
    name: string;
    verificationStatus: string;
    rejectionReason?: string;
}

interface UserStats {
    adsCount: number;
    totalViews: number;
    unreadMessages: number;
    favoritesReceived: number;
    pendingAds: number;
    rejectedAds: number;
    userFavorites: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch profile
                const profileRes = await fetch('/api/user/profile');
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    if (data.success) {
                        setProfile(data.data);
                    }
                }

                // Fetch stats
                const statsRes = await fetch('/api/user/stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    if (data.success) {
                        setStats(data.data);
                    }
                }
            } catch (error) {
                console.error("Erreur chargement données", error);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-500">Bienvenue dans votre espace vendeur, <span className="font-semibold text-primary">{user?.name}</span>.</p>
            </div>

            {/* Notification de rejet */}
            {profile?.verificationStatus === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900">Vérification refusée</h3>
                        <p className="text-red-700 mt-1">
                            Votre demande de vérification a été rejetée.
                            {profile.rejectionReason && (
                                <span className="block mt-1 font-medium">Raison : "{profile.rejectionReason}"</span>
                            )}
                        </p>
                        <Link href="/dashboard/settings" className="text-sm font-medium text-red-600 hover:text-red-500 mt-2 inline-block">
                            ➔ Mettre à jour mon profil
                        </Link>
                    </div>
                </div>
            )}

            {/* Notification annonces en attente */}
            {stats && stats.pendingAds > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-amber-900">
                            {stats.pendingAds} annonce{stats.pendingAds > 1 ? 's' : ''} en attente
                        </h3>
                        <p className="text-amber-700 mt-1">
                            Vos annonces sont en cours de vérification par notre équipe.
                        </p>
                        <Link href="/dashboard/annonces" className="text-sm font-medium text-amber-600 hover:text-amber-500 mt-2 inline-block">
                            ➔ Voir mes annonces
                        </Link>
                    </div>
                </div>
            )}

            {/* Notification annonces rejetées */}
            {stats && stats.rejectedAds > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900">
                            {stats.rejectedAds} annonce{stats.rejectedAds > 1 ? 's' : ''} rejetée{stats.rejectedAds > 1 ? 's' : ''}
                        </h3>
                        <p className="text-red-700 mt-1">
                            Certaines de vos annonces n'ont pas été approuvées.
                        </p>
                        <Link href="/dashboard/annonces" className="text-sm font-medium text-red-600 hover:text-red-500 mt-2 inline-block">
                            ➔ Voir les détails
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Annonces en ligne"
                    value={loadingStats ? "..." : stats?.adsCount?.toString() || "0"}
                    icon={ShoppingBag}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                    href="/dashboard/annonces"
                />
                <StatCard
                    title="Vues totales"
                    value={loadingStats ? "..." : formatNumber(stats?.totalViews || 0)}
                    icon={Eye}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Messages non lus"
                    value={loadingStats ? "..." : stats?.unreadMessages?.toString() || "0"}
                    icon={MessageCircle}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                    href="/dashboard/messages"
                    highlight={(stats?.unreadMessages ?? 0) > 0}
                />
                <StatCard
                    title="Favoris reçus"
                    value={loadingStats ? "..." : stats?.favoritesReceived?.toString() || "0"}
                    icon={Heart}
                    color="text-pink-600"
                    bgColor="bg-pink-50"
                />
            </div>

            {/* Section Annonces & Actualités (placeholder pour le système d'annonces admin) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📢 Annonces & Actualités
                </h2>
                <div className="space-y-4">
                    {/* Placeholder - sera remplacé par les annonces admin */}
                    <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="font-medium text-gray-900">Conseils pour vendre plus</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Ajoutez des photos de qualité, répondez rapidement aux messages et décrivez précisément l'état de vos produits.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <h3 className="font-medium text-gray-900">Bienvenue sur SweetLook !</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Votre plateforme de confiance pour acheter, vendre et proposer des services.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Formatage des nombres (1234 -> "1 234")
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    href?: string;
    highlight?: boolean;
}

function StatCard({ title, value, icon: Icon, color, bgColor, href, highlight }: StatCardProps) {
    const content = (
        <div className={`bg-white p-6 rounded-xl shadow-sm border ${highlight ? 'border-orange-300 ring-2 ring-orange-100' : 'border-gray-100'} flex items-center gap-4 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
            <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className={`text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</p>
            </div>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}
