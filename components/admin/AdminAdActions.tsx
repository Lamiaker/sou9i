"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Check, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { mutate } from "swr";

interface AdminAdActionsProps {
    adId: string;
    moderationStatus: string;
    rejectionReason?: string | null;
}

export default function AdminAdActions({ adId, moderationStatus, rejectionReason }: AdminAdActionsProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // ✅ ARCHITECTURE LONG TERME : Masquer le panneau si l'utilisateur n'est pas ADMIN
    // Cela se fait côté client pour permettre au serveur de mettre la page en cache ISR.
    if (!session || session.user.role !== 'ADMIN') {
        return null;
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        let reason = '';

        if (action === 'reject') {
            const input = prompt("Raison du rejet de l'annonce :");
            if (input === null) return; // Annuler
            if (!input.trim()) {
                alert("Veuillez fournir une raison pour le rejet.");
                return;
            }
            reason = input;
        } else {
            if (!confirm("Voulez-vous vraiment approuver cette annonce ?")) return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    adId,
                    reason
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            // Rafraîchir les données
            router.refresh();
            mutate((key) => typeof key === 'string' && key.startsWith('/api/admin/ads'));

            // Note: Le revalidatePath est géré côté serveur dans la route API

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Bandeau d'état
    const getStatusConfig = () => {
        switch (moderationStatus) {
            case 'PENDING':
                return {
                    title: '⏳ Annonce en attente de validation',
                    message: "Cette annonce n'est pas encore visible publiquement. Vous pouvez la valider ou la rejeter ici.",
                    bg: 'bg-amber-50 border-amber-200',
                    text: 'text-amber-800'
                };
            case 'REJECTED':
                return {
                    title: '❌ Annonce rejetée',
                    message: `Raison: ${rejectionReason || 'Non spécifiée'}`,
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-800'
                };
            case 'APPROVED':
                return {
                    title: '✅ Annonce publiée',
                    message: 'Cette annonce est visible par tous les utilisateurs.',
                    bg: 'bg-emerald-50 border-emerald-200',
                    text: 'text-emerald-800'
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
        <div className={`${config.bg} border-b ${config.text} transition-all duration-300`}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="mt-1">
                        {moderationStatus === 'PENDING' ? <Loader2 className="animate-spin" size={20} /> :
                            moderationStatus === 'APPROVED' ? <ShieldCheck className="text-emerald-600" size={20} /> :
                                <AlertCircle className="text-red-600" size={20} />}
                    </div>
                    <div>
                        <p className="font-semibold text-sm sm:text-base">{config.title}</p>
                        <p className="text-xs sm:text-sm opacity-90">{config.message}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    {moderationStatus !== 'APPROVED' && (
                        <button
                            onClick={() => handleAction('approve')}
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            Approuver
                        </button>
                    )}

                    {moderationStatus !== 'REJECTED' && (
                        <button
                            onClick={() => handleAction('reject')}
                            disabled={loading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
                        >
                            <X size={16} />
                            Rejeter
                        </button>
                    )}

                    <a
                        href="/sl-panel-9x7k/ads"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        Admin
                    </a>
                </div>
            </div>
        </div>
    );
}
