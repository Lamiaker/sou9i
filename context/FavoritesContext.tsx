"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";

const LOCAL_STORAGE_KEY = "user_favorites";
const LOCAL_STORAGE_TIMESTAMP_KEY = "user_favorites_timestamp";
const FAVORITES_EXPIRY_DAYS = 30; // Les favoris locaux expirent après 30 jours

interface SyncResult {
    added: number;
    skipped: number;
}

interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    isLoading: boolean;
    isSyncing: boolean;
    syncResult: SyncResult | null;
    clearSyncResult: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

    // Ref pour tracker si on a déjà synchronisé pour cette session
    const hasSyncedRef = useRef(false);
    // Ref pour stocker les favoris locaux avant sync
    const localFavoritesRef = useRef<string[]>([]);

    /**
     * Vérifie si les favoris locaux ont expiré
     */
    const areLocalFavoritesExpired = useCallback((): boolean => {
        if (typeof window === 'undefined') return true;
        try {
            const timestamp = localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY);
            if (!timestamp) return false; // Pas de timestamp = nouveaux favoris

            const savedDate = new Date(parseInt(timestamp, 10));
            const now = new Date();
            const diffDays = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);

            return diffDays > FAVORITES_EXPIRY_DAYS;
        } catch {
            return false;
        }
    }, []);

    /**
     * Récupère les favoris depuis localStorage (pour visiteurs)
     */
    const getLocalFavorites = useCallback((): string[] => {
        if (typeof window === 'undefined') return [];

        // Vérifier l'expiration
        if (areLocalFavoritesExpired()) {
            // Nettoyer les favoris expirés
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_TIMESTAMP_KEY);
            return [];
        }

        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed.filter((id): id is string => typeof id === 'string');
                }
            }
        } catch (e) {
            console.error("Erreur parsing favoris local", e);
        }
        return [];
    }, [areLocalFavoritesExpired]);

    /**
     * Sauvegarde les favoris dans localStorage avec timestamp (pour visiteurs)
     */
    const setLocalFavorites = useCallback((favs: string[]) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favs));
            // Mettre à jour le timestamp seulement si c'est la première sauvegarde
            if (!localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY)) {
                localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, Date.now().toString());
            }
        } catch (e) {
            console.error("Erreur sauvegarde favoris local", e);
        }
    }, []);

    /**
     * Nettoie les favoris locaux après synchronisation réussie
     */
    const clearLocalFavorites = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(LOCAL_STORAGE_TIMESTAMP_KEY);
        } catch (e) {
            console.error("Erreur suppression favoris local", e);
        }
    }, []);

    /**
     * Nettoie le résultat de synchronisation
     */
    const clearSyncResult = useCallback(() => {
        setSyncResult(null);
    }, []);

    /**
     * Synchronise les favoris locaux vers le serveur
     */
    const syncLocalFavoritesToServer = useCallback(async (localFavs: string[]): Promise<string[]> => {
        if (localFavs.length === 0) return [];

        try {
            setIsSyncing(true);
            const response = await fetch('/api/favorites/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adIds: localFavs }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Stocker le résultat pour notification
                    setSyncResult({
                        added: data.data.added,
                        skipped: data.data.skipped
                    });

                    // Nettoyer localStorage après sync réussie
                    clearLocalFavorites();
                    return data.data.favorites;
                }
            } else {
                console.error("Erreur sync favoris:", response.status);
            }
        } catch (error) {
            console.error("Erreur lors de la synchronisation des favoris", error);
        } finally {
            setIsSyncing(false);
        }
        return [];
    }, [clearLocalFavorites]);

    /**
     * Charge les favoris depuis le serveur (utilisateur connecté)
     */
    const loadServerFavorites = useCallback(async (): Promise<string[]> => {
        try {
            const response = await fetch('/api/favorites');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.data.map((fav: { adId: string }) => fav.adId);
                }
            }
        } catch (error) {
            console.error("Erreur chargement favoris API", error);
        }
        return [];
    }, []);

    // Effet principal : charger et synchroniser les favoris
    useEffect(() => {
        const initFavorites = async () => {
            if (status === "loading") return;

            setIsLoading(true);

            if (status === "authenticated" && session?.user?.id) {
                // Utilisateur connecté

                // 1. D'abord, récupérer les favoris locaux AVANT de charger depuis le serveur
                const localFavs = getLocalFavorites();
                localFavoritesRef.current = localFavs;

                // 2. Charger les favoris serveur
                const serverFavs = await loadServerFavorites();

                // 3. Si on a des favoris locaux et qu'on n'a pas encore synchronisé
                if (localFavs.length > 0 && !hasSyncedRef.current) {
                    hasSyncedRef.current = true;

                    // Synchroniser les favoris locaux vers le serveur
                    const syncedFavs = await syncLocalFavoritesToServer(localFavs);

                    if (syncedFavs.length > 0) {
                        // Utiliser les favoris synchronisés
                        setFavorites(syncedFavs);
                    } else {
                        // Fallback : utiliser les favoris serveur
                        setFavorites(serverFavs);
                    }
                } else {
                    // Pas de favoris locaux, utiliser les favoris serveur
                    setFavorites(serverFavs);
                }
            } else if (status === "unauthenticated") {
                // Visiteur : charger depuis localStorage
                const localFavs = getLocalFavorites();
                setFavorites(localFavs);
                // Reset le flag de sync pour la prochaine connexion
                hasSyncedRef.current = false;
            }

            setIsLoading(false);
        };

        initFavorites();
    }, [session, status, getLocalFavorites, loadServerFavorites, syncLocalFavoritesToServer]);

    // Sauvegarder dans localStorage pour les non-connectés
    useEffect(() => {
        if (status === "unauthenticated" && !isLoading) {
            setLocalFavorites(favorites);
        }
    }, [favorites, status, isLoading, setLocalFavorites]);

    /**
     * Toggle un favori (ajouter ou retirer)
     */
    const toggleFavorite = async (id: string) => {
        const isCurrentlyFavorite = favorites.includes(id);

        // Optimistic update
        setFavorites((prev) => {
            if (prev.includes(id)) {
                return prev.filter((favId) => favId !== id);
            } else {
                return [...prev, id];
            }
        });

        if (status === "authenticated" && session?.user?.id) {
            try {
                if (isCurrentlyFavorite) {
                    // DELETE - Retirer des favoris
                    const response = await fetch(`/api/favorites?adId=${id}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        // Revert on error
                        setFavorites((prev) => [...prev, id]);
                    }
                } else {
                    // POST - Ajouter aux favoris
                    const response = await fetch("/api/favorites", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ adId: id }),
                    });

                    if (!response.ok) {
                        // Revert on error
                        setFavorites((prev) => prev.filter((favId) => favId !== id));
                    }
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour du favori", error);
                // Revert on error
                if (isCurrentlyFavorite) {
                    setFavorites((prev) => [...prev, id]);
                } else {
                    setFavorites((prev) => prev.filter((favId) => favId !== id));
                }
            }
        }
        // Pour les visiteurs, la sauvegarde dans localStorage est gérée par l'effet
    };

    const isFavorite = (id: string) => {
        return favorites.includes(id);
    };

    return (
        <FavoritesContext.Provider value={{
            favorites,
            toggleFavorite,
            isFavorite,
            isLoading,
            isSyncing,
            syncResult,
            clearSyncResult
        }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
