// ============================================
// Types liés aux Annonces (Ads)
// Types pour l'affichage frontend des annonces
// ============================================

import type { Seller } from './user'

/**
 * Représentation simplifiée d'un produit pour l'affichage dans les listes.
 * Utilisé pour les cartes de produits et les grilles.
 * 
 * @example
 * ```tsx
 * const product: Product = {
 *   id: "abc123",
 *   title: "iPhone 14 Pro",
 *   price: "8500 DH",
 *   location: "Casablanca",
 *   image: "/uploads/iphone.jpg"
 * }
 * ```
 */
export interface Product {
    /** Identifiant unique du produit */
    id: string
    /** Titre de l'annonce */
    title: string
    /** Prix formaté avec devise (ex: "1500 DH") */
    price: string
    /** Ville ou région de l'annonce */
    location?: string
    /** Image principale du produit */
    image?: string
    /** Liste des URLs des photos */
    photos?: string[]
    /** Nom de la catégorie */
    category?: string
    /** Nom de la sous-catégorie */
    subcategory?: string
    /** Description détaillée */
    description?: string
    /** Date de publication formatée (ex: "Il y a 2 jours") */
    postedTime?: string
    /** État du produit (neuf, occasion, etc.) */
    condition?: string
    /** Informations sur le vendeur */
    seller?: Seller
}

/**
 * Représentation détaillée d'un produit avec informations complètes du vendeur.
 * Utilisé pour la page de détail d'une annonce.
 * 
 * @example
 * ```tsx
 * <ProductDetail item={productItem} />
 * ```
 */
export interface ProductItem {
    /** Identifiant unique */
    id: string
    /** Nom du vendeur */
    sellerName: string
    /** Note moyenne du vendeur (0-5) */
    sellerRating: number
    /** Nombre total d'avis */
    sellerReviews: number
    /** URL de l'avatar du vendeur */
    sellerAvatar: string
    /** Titre de l'annonce */
    title: string
    /** Prix formaté avec devise */
    price: string
    /** Liste des URLs des photos */
    photos: string[]
    /** Localisation complète */
    location: string
    /** Date de publication formatée */
    postedTime: string
    /** Indique si la livraison est disponible */
    deliveryAvailable: boolean
    /** Types de livraison disponibles */
    deliveryMethods: string[]
    /** Description détaillée */
    description?: string
    /** État du produit */
    condition?: string
    /** Marque du produit */
    brand?: string
    /** Taille (vêtements, chaussures) */
    size?: string
}

/**
 * Représentation d'une annonce pour les cartes et listes.
 * Type principal pour l'affichage dans les grilles d'annonces.
 * 
 * @example
 * ```tsx
 * {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
 * ```
 */
export interface Ad {
    /** Identifiant unique de l'annonce */
    id: string
    /** Titre de l'annonce (max 100 caractères) */
    title: string
    /** Prix formaté avec devise */
    price: string
    /** Ville de publication */
    location: string
    /** URL de l'image principale */
    image: string
    /** Nom de la catégorie principale */
    category: string
    /** Nom de la sous-catégorie */
    subcategory: string
    /** Date de publication formatée */
    date: string
    /** Description courte ou complète */
    description?: string
    /** Informations du vendeur */
    seller?: Seller
    /** Nombre de vues */
    views?: number
    /** Indique si l'annonce est en favoris pour l'utilisateur courant */
    isFavorite?: boolean
}

/**
 * Données du formulaire de création/édition d'annonce.
 * Utilisé avec react-hook-form ou des formulaires contrôlés.
 * 
 * @example
 * ```tsx
 * const { register, handleSubmit } = useForm<AdFormData>()
 * ```
 */
export interface AdFormData {
    /** Titre de l'annonce (3-100 caractères) */
    title: string
    /** ID de la catégorie sélectionnée */
    category: string
    /** ID de la sous-catégorie */
    subcategory: string
    /** Description détaillée (20-2000 caractères) */
    description: string
    /** Prix en dirhams (nombre entier) */
    price: number
    /** Images à uploader (File[]) ou URLs existantes (string[]) */
    images: File[] | string[]
    /** Ville de publication */
    city: string
    /** Adresse précise (optionnel) */
    address?: string
    /** Nom du vendeur */
    sellerName: string
    /** Email de contact */
    sellerEmail: string
    /** Numéro de téléphone */
    sellerPhone: string
    /** État du produit */
    condition?: string
    /** 
     * Champs dynamiques selon la catégorie.
     * Les clés sont les noms des champs définis pour la sous-catégorie.
     */
    [key: string]: unknown
}

/**
 * Filtres de recherche pour les annonces côté frontend.
 * Utilisé pour construire les paramètres de recherche URL.
 * 
 * @example
 * ```tsx
 * const filters: SearchFilters = {
 *   category: "mode",
 *   minPrice: 100,
 *   maxPrice: 500,
 *   sortBy: "price-asc"
 * }
 * ```
 */
export interface SearchFilters {
    /** Slug de la catégorie */
    category?: string
    /** Slug de la sous-catégorie */
    subcategory?: string
    /** Prix minimum en DH */
    minPrice?: number
    /** Prix maximum en DH */
    maxPrice?: number
    /** Ville ou région */
    location?: string
    /** État du produit (neuf, occasion, etc.) */
    condition?: string
    /** Critère de tri */
    sortBy?: 'recent' | 'price-asc' | 'price-desc'
}

