"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";
import { cn } from "@/lib/utils/helpers";

interface FavoriteButtonProps {
    adId: string;
    className?: string;
    size?: number;
}

export default function FavoriteButton({ adId, className, size = 20 }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const active = isFavorite(adId);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Empêcher la navigation et la propagation de l'événement
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        // Toggle le favori sans navigation
        toggleFavorite(adId);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
                "p-2 rounded-full transition shadow-sm flex items-center justify-center",
                active
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white",
                className
            )}
            title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart size={size} fill={active ? "currentColor" : "none"} />
        </button>
    );
}

