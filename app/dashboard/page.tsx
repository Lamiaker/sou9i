"use client";

import { useEffect, useState } from 'react';
import { ShoppingBag, Eye, MessageCircle, TrendingUp, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from 'next/link';

interface UserProfile {
    id: string;
    name: string;
    verificationStatus: string;
    rejectionReason?: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setProfile(data.data);
                    }
                }
            } catch (error) {
                console.error("Erreur chargement profil", error);
            }
        };
        fetchProfile();
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
                                <span className="block mt-1 font-medium">Raison : &quot;{profile.rejectionReason}&quot;</span>
                            )}
                        </p>
                        <Link href="/dashboard/settings" className="text-sm font-medium text-red-600 hover:text-red-500 mt-2 inline-block">
                            ➔ Mettre à jour mon profil
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Annonces en ligne"
                    value="12"
                    icon={ShoppingBag}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Vues totales"
                    value="1,234"
                    icon={Eye}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Messages non lus"
                    value="3"
                    icon={MessageCircle}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
                <StatCard
                    title="Ventes ce mois"
                    value="5"
                    icon={TrendingUp}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
            </div>

            {/* Recent Activity or Tips could go here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières performances</h2>
                <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Graphique des vues (à venir)
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bgColor} ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
