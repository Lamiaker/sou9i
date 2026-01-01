'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Bell,
    X,
    AlertTriangle,
    ShoppingBag,
    Users,
    HeadphonesIcon,
    TrendingUp,
    TrendingDown,
    UserX,
    ChevronRight,
    CheckCircle,
} from 'lucide-react';
import { ActiveAlert, countAlertsByType } from '@/lib/admin-alerts';

// Mapping des icônes
const iconMap: Record<string, React.ElementType> = {
    AlertTriangle,
    ShoppingBag,
    Users,
    HeadphonesIcon,
    TrendingUp,
    TrendingDown,
    UserX,
};

interface AlertsPanelProps {
    alerts: ActiveAlert[];
    onDismiss?: (alertId: string) => void;
}

/**
 * Panneau d'alertes pour le dashboard admin
 */
export function AlertsPanel({ alerts, onDismiss }: AlertsPanelProps) {
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
    const [isExpanded, setIsExpanded] = useState(true);

    // Charger les alertes dismissées du localStorage
    useEffect(() => {
        const stored = localStorage.getItem('dismissedAlerts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Nettoyer les alertes expirées (plus de 24h)
                const now = Date.now();
                const valid = Object.entries(parsed)
                    .filter(([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000)
                    .map(([id]) => id);
                setDismissedAlerts(new Set(valid));
            } catch {
                setDismissedAlerts(new Set());
            }
        }
    }, []);

    const handleDismiss = (alertId: string) => {
        const newDismissed = new Set(dismissedAlerts);
        newDismissed.add(alertId);
        setDismissedAlerts(newDismissed);

        // Sauvegarder avec timestamp
        const stored = JSON.parse(localStorage.getItem('dismissedAlerts') || '{}');
        stored[alertId] = Date.now();
        localStorage.setItem('dismissedAlerts', JSON.stringify(stored));

        onDismiss?.(alertId);
    };

    // Filtrer les alertes non ignorées
    const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));
    const counts = countAlertsByType(visibleAlerts);

    if (visibleAlerts.length === 0) {
        return null;
    }

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'danger':
                return 'bg-red-500/10 border-red-500/30 text-red-400';
            case 'warning':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            case 'info':
                return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            default:
                return 'bg-white/5 border-white/10 text-white/60';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'danger':
                return 'text-red-400';
            case 'warning':
                return 'text-amber-400';
            case 'info':
                return 'text-blue-400';
            default:
                return 'text-white/60';
        }
    };

    return (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell className="w-5 h-5 text-white" />
                        {visibleAlerts.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {visibleAlerts.length}
                            </span>
                        )}
                    </div>
                    <span className="text-white font-semibold">Alertes</span>
                    <div className="flex items-center gap-2 ml-2">
                        {counts.danger > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                                {counts.danger} critique{counts.danger > 1 ? 's' : ''}
                            </span>
                        )}
                        {counts.warning > 0 && (
                            <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full">
                                {counts.warning} avertissement{counts.warning > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronRight
                    className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
            </button>

            {/* Alerts list */}
            {isExpanded && (
                <div className="border-t border-white/10 divide-y divide-white/5">
                    {visibleAlerts.map((alert) => {
                        const IconComponent = iconMap[alert.icon] || AlertTriangle;
                        return (
                            <div
                                key={alert.id}
                                className={`p-4 flex items-start gap-3 ${getTypeStyles(alert.type)}`}
                            >
                                <div className={`mt-0.5 ${getIconColor(alert.type)}`}>
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm font-medium">{alert.name}</p>
                                    <p className="text-white/60 text-xs mt-0.5">{alert.message}</p>
                                    {alert.href && (
                                        <Link
                                            href={alert.href}
                                            className="inline-flex items-center gap-1 text-xs mt-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                                        >
                                            Traiter maintenant
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                                    title="Ignorer pour 24h"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/**
 * Badge de notification pour le header/sidebar
 */
interface AlertBadgeProps {
    count: number;
    type?: 'danger' | 'warning' | 'info';
    pulse?: boolean;
}

export function AlertBadge({ count, type = 'danger', pulse = true }: AlertBadgeProps) {
    if (count === 0) return null;

    const colors = {
        danger: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    return (
        <span className="relative">
            <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full ${colors[type]}`}
            >
                {count > 99 ? '99+' : count}
            </span>
            {pulse && (
                <span
                    className={`absolute inset-0 rounded-full ${colors[type]} animate-ping opacity-50`}
                />
            )}
        </span>
    );
}

/**
 * Composant de notification toast
 */
interface ToastNotificationProps {
    alert: ActiveAlert;
    onClose: () => void;
    autoClose?: number;
}

export function ToastNotification({ alert, onClose, autoClose = 5000 }: ToastNotificationProps) {
    useEffect(() => {
        if (autoClose > 0) {
            const timer = setTimeout(onClose, autoClose);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const IconComponent = iconMap[alert.icon] || AlertTriangle;

    const bgColors = {
        danger: 'from-red-500/20 to-red-900/20 border-red-500/30',
        warning: 'from-amber-500/20 to-amber-900/20 border-amber-500/30',
        info: 'from-blue-500/20 to-blue-900/20 border-blue-500/30',
    };

    const iconColors = {
        danger: 'text-red-400',
        warning: 'text-amber-400',
        info: 'text-blue-400',
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 max-w-sm p-4 rounded-xl border backdrop-blur-xl bg-gradient-to-r ${bgColors[alert.type]} shadow-2xl animate-slide-up`}
        >
            <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 mt-0.5 ${iconColors[alert.type]}`} />
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{alert.name}</p>
                    <p className="text-white/60 text-xs mt-1">{alert.message}</p>
                    {alert.href && (
                        <Link
                            href={alert.href}
                            className="inline-flex items-center gap-1 text-xs mt-2 text-cyan-400 hover:text-cyan-300"
                            onClick={onClose}
                        >
                            Voir détails
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/**
 * Indicateur de statut global
 */
interface StatusIndicatorProps {
    alerts: ActiveAlert[];
}

export function StatusIndicator({ alerts }: StatusIndicatorProps) {
    const counts = countAlertsByType(alerts);

    if (alerts.length === 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">Tout est en ordre</span>
            </div>
        );
    }

    if (counts.danger > 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                    {counts.danger} alerte{counts.danger > 1 ? 's' : ''} critique{counts.danger > 1 ? 's' : ''}
                </span>
            </div>
        );
    }

    if (counts.warning > 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">
                    {counts.warning} avertissement{counts.warning > 1 ? 's' : ''}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Bell className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">
                {counts.info} notification{counts.info > 1 ? 's' : ''}
            </span>
        </div>
    );
}
