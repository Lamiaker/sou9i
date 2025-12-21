"use client";

import { useState, useEffect } from 'react';
import { X, Flag, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/Toast';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    adId?: string;
    adTitle?: string;
    userId?: string;
    userName?: string;
}

const REPORT_REASONS = [
    { value: 'Fraude ou arnaque', label: 'Fraude ou arnaque', icon: '🚨' },
    { value: 'Contenu inapproprié', label: 'Contenu inapproprié', icon: '🔞' },
    { value: 'Produit interdit', label: 'Produit interdit', icon: '🚫' },
    { value: 'Fausse annonce', label: 'Fausse annonce', icon: '❌' },
    { value: 'Harcèlement', label: 'Harcèlement', icon: '😠' },
    { value: 'Spam ou publicité', label: 'Spam ou publicité', icon: '📢' },
    { value: 'Autre', label: 'Autre raison', icon: '❓' },
];

export default function ReportModal({
    isOpen,
    onClose,
    adId,
    adTitle,
    userId,
    userName
}: ReportModalProps) {
    const { data: session } = useSession();
    const toast = useToast();
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedReason('');
            setDetails('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!session) {
            toast.error('Vous devez être connecté pour signaler');
            onClose();
            return;
        }

        if (!selectedReason) {
            toast.warning('Veuillez sélectionner une raison');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason: selectedReason,
                    details: details.trim() || null,
                    adId: adId || null,
                    reportedUserId: userId || null
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi');
            }

            toast.success('Signalement envoyé ! Notre équipe va l\'examiner.');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Erreur lors de l\'envoi du signalement');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const targetName = adTitle || userName || 'cet élément';
    const isReportingAd = !!adId;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[70px] sm:pb-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => !loading && onClose()}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[calc(100vh-90px)] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-white">
                                    Signaler {isReportingAd ? 'l\'annonce' : 'le vendeur'}
                                </h2>
                                <p className="text-white/80 text-xs sm:text-sm truncate max-w-[180px] sm:max-w-[200px]">
                                    {targetName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => !loading && onClose()}
                            className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Warning */}
                    <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-amber-700">
                            Les signalements abusifs peuvent entraîner des sanctions sur votre compte.
                        </p>
                    </div>

                    {/* Reason Selection */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                            Pourquoi signalez-vous ?
                        </label>
                        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.value}
                                    type="button"
                                    onClick={() => setSelectedReason(reason.value)}
                                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border-2 transition-all text-left ${selectedReason === reason.value
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    <span className="text-lg sm:text-xl">{reason.icon}</span>
                                    <span className="font-medium text-sm sm:text-base">{reason.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                            Détails <span className="text-gray-400 font-normal text-xs sm:text-sm">(optionnel)</span>
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Décrivez le problème..."
                            rows={2}
                            maxLength={500}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm sm:text-base"
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">
                            {details.length}/500
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 flex gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !selectedReason}
                        className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                <span className="hidden sm:inline">Envoi...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                Envoyer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
