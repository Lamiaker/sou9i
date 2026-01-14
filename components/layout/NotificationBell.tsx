"use client";

import { useState, useRef, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { Bell, Check, ExternalLink, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils/helpers';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Composant de cloche de notification avec dropdown
 */
export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, error, isLoading } = useSWR('/api/notifications', fetcher, {
        refreshInterval: 30000, // Rafraîchir toutes les 30 secondes
    });

    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount || 0;

    // Fermer le dropdown au clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId: id }),
            });
            mutate('/api/notifications');
        } catch (error) {
            console.error('Erreur markAsRead:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            });
            mutate('/api/notifications');
        } catch (error) {
            console.error('Erreur markAllAsRead:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bouton Cloche (Adaptatif Mobile/Desktop) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col lg:items-center p-2 lg:p-0 hover:bg-gray-100 lg:hover:bg-transparent rounded-full lg:rounded-none group cursor-pointer relative text-gray-700 transition"
                aria-label="Notifications"
            >
                <div className="relative">
                    <Bell size={22} className="group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
                <span className="relative text-xs font-medium mt-1 hidden lg:block">
                    Alertes
                    <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-secondary origin-left transition-transform duration-300 ${isOpen ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="max-h-[70vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
                                <Loader2 className="animate-spin mb-2" size={24} />
                                <p className="text-sm">Chargement...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="mx-auto mb-2 opacity-20" size={48} />
                                <p className="text-sm">Aucune notification pour le moment</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif: any) => {
                                    const notificationContent = (
                                        <div className="flex gap-3">
                                            {/* Indicateur non lu */}
                                            <div className="flex-shrink-0 mt-1">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                                                    {notif.title}
                                                </p>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">
                                                        {formatRelativeTime(notif.createdAt)}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {!notif.read && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    markAsRead(notif.id);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                                                                title="Marquer comme lu"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        {notif.link && (
                                                            <span className="p-1 text-gray-400">
                                                                <ExternalLink size={14} />
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    const baseClassName = `block p-4 hover:bg-gray-50 transition cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`;

                                    return notif.link ? (
                                        <Link
                                            key={notif.id}
                                            href={notif.link}
                                            onClick={() => {
                                                markAsRead(notif.id);
                                                setIsOpen(false);
                                            }}
                                            className={baseClassName}
                                        >
                                            {notificationContent}
                                        </Link>
                                    ) : (
                                        <div key={notif.id} className={baseClassName}>
                                            {notificationContent}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 text-center border-t border-gray-50 bg-gray-50/30">
                        <Link
                            href="/dashboard/notifications"
                            className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Voir toutes les notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
