"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";


interface FavoritesContextType {
    favorites: string[];
    toggleFavorite: (id: string) => Promise<void>;
    isFavorite: (id: string) => boolean;
    isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Charger les favoris
    useEffect(() => {
        const loadFavorites = async () => {
            if (status === "loading") return;

            if (status === "authenticated" && session?.user?.id) {
                try {
                    const response = await fetch(`/api/favorites?userId=${session.user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success) {
                            // Extract IDs from the returned favorite objects
                            const favIds = data.data.map((fav: any) => fav.adId);
                            setFavorites(favIds);
                        }
                    }
                } catch (error) {
                    console.error("Erreur chargement favoris API", error);
                }
            } else {
                // Fallback localStorage pour non-connectés
                const storedFavorites = localStorage.getItem("user_favorites");
                if (storedFavorites) {
                    try {
                        setFavorites(JSON.parse(storedFavorites));
                    } catch (e) {
                        console.error("Erreur parsing favoris local", e);
                    }
                }
            }
            setIsLoading(false);
        };

        loadFavorites();
    }, [session, status]);

    // Sauvegarder dans localStorage pour les non-connectés (backup)
    useEffect(() => {
        if (status === "unauthenticated") {
            localStorage.setItem("user_favorites", JSON.stringify(favorites));
        }
    }, [favorites, status]);

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
                    // DELETE
                    await fetch(`/api/favorites?userId=${session.user.id}&adId=${id}`, {
                        method: "DELETE",
                    });
                } else {
                    // POST
                    await fetch("/api/favorites", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: session.user.id, adId: id }),
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour du favori", error);
                // Revert optimist on error (optional but good practice)
                // For simplicity, we just log error here as reverting complex state is tricky without more logic
            }
        }
    };

    const isFavorite = (id: string) => {
        return favorites.includes(id);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoading }}>
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
