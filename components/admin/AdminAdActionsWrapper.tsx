"use client";

import dynamic from "next/dynamic";

// Charge AdminAdActions uniquement côté client
// Évite les problèmes de SSR avec les vérifications de session admin
const AdminAdActions = dynamic(() => import("@/components/admin/AdminAdActions"), {
    ssr: false,
});

interface AdminAdActionsWrapperProps {
    adId: string;
    moderationStatus: string;
    rejectionReason: string | null;
}

/**
 * Wrapper client pour AdminAdActions
 * Nécessaire car `ssr: false` n'est pas autorisé dans les Server Components (Next.js 16+)
 */
export default function AdminAdActionsWrapper({
    adId,
    moderationStatus,
    rejectionReason,
}: AdminAdActionsWrapperProps) {
    return (
        <AdminAdActions
            adId={adId}
            moderationStatus={moderationStatus}
            rejectionReason={rejectionReason}
        />
    );
}
