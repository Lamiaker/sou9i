"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Heart } from "lucide-react";
import FavoriteButton from "@/components/ui/FavoriteButton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Helper for formatting price
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-DZ', {
        style: 'currency',
        currency: 'DZD',
        maximumFractionDigits: 0,
    }).format(price);
};

export interface AdCardProps {
    id: string;
    title: string;
    price: number;
    images?: string[];
    location?: string;
    createdAt?: string | Date;
    showFavoriteButton?: boolean;
    /** Si défini, affiche un bouton de suppression au lieu du bouton favori standard */
    onRemove?: (id: string) => void;
    className?: string;
}

/**
 * Composant carte d'annonce réutilisable
 * Le bouton favori est placé EN DEHORS du Link pour éviter les conflits de navigation
 */
export default function AdCard({
    id,
    title,
    price,
    images,
    location,
    createdAt,
    showFavoriteButton = true,
    onRemove,
    className = "",
}: AdCardProps) {
    const imageSrc = images && images.length > 0 ? images[0] : "/user.png";

    const formattedDate = createdAt
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })
        : "";

    const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        onRemove?.(id);
    };

    return (
        <div className={`group relative ${className}`}>
            {/* Bouton d'action - TOUJOURS en dehors du Link */}
            {onRemove ? (
                // Bouton de suppression (pour les pages favoris)
                <button
                    type="button"
                    onClick={handleRemove}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition z-20"
                    title="Retirer des favoris"
                >
                    <Heart size={18} fill="currentColor" />
                </button>
            ) : showFavoriteButton ? (
                // Bouton favori standard
                <div className="absolute top-3 right-3 z-20">
                    <FavoriteButton adId={id} size={18} />
                </div>
            ) : null}

            <Link href={`/annonces/${id}`} className="block h-full">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
                    {/* Image */}
                    <div className="aspect-[4/3] relative bg-gray-100">
                        <Image
                            src={imageSrc}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            unoptimized
                        />
                    </div>

                    {/* Contenu */}
                    <div className="p-4 flex flex-col flex-1">
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition mb-1">
                                {title}
                            </h3>
                            <p className="text-lg font-bold text-primary">
                                {formatPrice(price)}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                {location || "Algérie"}
                            </div>
                            {formattedDate && <span>{formattedDate}</span>}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
