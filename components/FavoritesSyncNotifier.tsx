"use client";

import { useEffect, useRef } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/components/ui/Toast";

/**
 * Composant invisible qui observe la synchronisation des favoris
 * et affiche des notifications toast appropriées
 */
export function FavoritesSyncNotifier() {
    const { syncResult, clearSyncResult } = useFavorites();
    const toast = useToast();
    const hasShownRef = useRef(false);

    useEffect(() => {
        if (syncResult && !hasShownRef.current) {
            hasShownRef.current = true;

            if (syncResult.added > 0) {
                toast.success(
                    `${syncResult.added} favori${syncResult.added > 1 ? 's' : ''} synchronisé${syncResult.added > 1 ? 's' : ''} avec succès !`
                );
            } else if (syncResult.skipped > 0 && syncResult.added === 0) {
                toast.info(
                    `Vos favoris sont déjà synchronisés.`
                );
            }

            // Nettoyer après affichage
            setTimeout(() => {
                clearSyncResult();
                hasShownRef.current = false;
            }, 100);
        }
    }, [syncResult, toast, clearSyncResult]);

    // Composant invisible
    return null;
}
