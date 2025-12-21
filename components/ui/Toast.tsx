"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        iconColor: 'text-emerald-400',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        iconColor: 'text-red-400',
    },
    warning: {
        icon: AlertCircle,
        bgColor: 'bg-amber-500/20',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        iconColor: 'text-amber-400',
    },
    info: {
        icon: Info,
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/30',
        textColor: 'text-cyan-400',
        iconColor: 'text-cyan-400',
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg animate-in slide-in-from-right-5 duration-300 ${config.bgColor} ${config.borderColor}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
            <p className={`flex-1 text-sm font-medium ${config.textColor}`}>{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 text-white/60" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, duration = 6000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = { id, type, message, duration };

        setToasts((prev) => [...prev, newToast]);

        // Auto-remove après la durée
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string) => showToast('success', message, 5000), [showToast]);
    const error = useCallback((message: string) => showToast('error', message, 10000), [showToast]); // Erreurs restent plus longtemps
    const warning = useCallback((message: string) => showToast('warning', message, 7000), [showToast]);
    const info = useCallback((message: string) => showToast('info', message, 5000), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container - Centré en haut */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={removeToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
