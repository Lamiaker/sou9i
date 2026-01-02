"use client";

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    Bell,
    Check,
    ExternalLink,
    Loader2,
    Trash2,
    CheckCheck,
    Megaphone,
    MessageCircle,
    ShoppingBag,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/helpers';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationsList() {
    const { data, error, isLoading } = useSWR('/api/notifications', fetcher);
    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount || 0;

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id, action: 'read' }),
            });
            mutate('/api/notifications');
        } catch (error) {
            console.error('Erreur markAsRead:', error);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true, action: 'read' }),
            });
            mutate('/api/notifications');
        } catch (error) {
            console.error('Erreur markAllAsRead:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'AD_APPROVED': return <ShieldCheck className="text-emerald-500" />;
            case 'AD_REJECTED': return <AlertCircle className="text-red-500" />;
            case 'NEW_MESSAGE': return <MessageCircle className="text-blue-500" />;
            case 'ACCOUNT_VERIFIED': return <ShieldCheck className="text-primary" />;
            case 'NEW_REVIEW': return <Megaphone className="text-yellow-500" />;
            default: return <Bell className="text-gray-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary mb-4" size={40} />
                <p className="text-gray-500">Chargement de vos notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 text-sm">Restez informé de l'activité de votre compte</p>
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm text-sm font-medium"
                    >
                        <CheckCheck size={18} />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-gray-300" size={32} />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h2>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        Vous n'avez pas encore reçu de notifications. Elles apparaîtront ici dès que possible.
                    </p>
                    <Link
                        href="/deposer"
                        className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition"
                    >
                        Vendre un article
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notif: any) => (
                            <div
                                key={notif.id}
                                className={`p-5 group transition-colors relative ${!notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex gap-4">
                                    {/* Icone */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${!notif.read ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                                        {getIcon(notif.type)}
                                    </div>

                                    {/* Contenu */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className={`font-bold text-gray-900 mb-1 ${!notif.read ? 'pr-6' : ''}`}>
                                                    {notif.title}
                                                    {!notif.read && (
                                                        <span className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full" />
                                                    )}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </span>

                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            Consulter
                                                            <ExternalLink size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
