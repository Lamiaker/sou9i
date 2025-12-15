// ============================================
// Types centralisés pour le projet Marché Femme
// ============================================

// --- Catégories ---
export interface SousCategorie {
    titre: string;
    items: string[];
    link?: string;
}

export interface Categorie {
    name: string;
    link?: string;
    image?: string;
    sousCategories: SousCategorie[];
}

// --- Produits ---
export interface Product {
    id: string;
    title: string;
    price: string;
    location?: string;
    image?: string;
    photos?: string[];
    category?: string;
    subcategory?: string;
    description?: string;
    postedTime?: string;
    condition?: string;
    seller?: Seller;
}

export interface ProductItem {
    id: string;
    sellerName: string;
    sellerRating: number;
    sellerReviews: number;
    sellerAvatar: string;
    title: string;
    price: string;
    photos: string[];
    location: string;
    postedTime: string;
    deliveryAvailable: boolean;
    deliveryMethods: string[];
    description?: string;
    condition?: string;
    brand?: string;
    size?: string;
}

// --- Annonces ---
export interface Ad {
    id: string;
    title: string;
    price: string;
    location: string;
    image: string;
    category: string;
    subcategory: string;
    date: string;
    description?: string;
    seller?: Seller;
    views?: number;
    isFavorite?: boolean;
}

// --- Utilisateurs ---
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    location?: string;
    memberSince?: string;
    verified?: boolean;
}

export interface Seller extends User {
    rating?: number;
    totalAds?: number;
}

// --- Tendances ---
export interface Tendance {
    title: string;
    img: string;
    link?: string;
}

// --- Filtres de recherche ---
export interface SearchFilters {
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
    sortBy?: 'recent' | 'price-asc' | 'price-desc';
}

// --- Messages ---
export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    adId?: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
    ad?: Ad;
}

// --- Dashboard Stats ---
export interface DashboardStats {
    totalAds: number;
    totalViews: number;
    unreadMessages: number;
    salesThisMonth: number;
}

// --- Formulaire de dépôt d'annonce ---
export interface AdFormData {
    title: string;
    category: string;
    subcategory: string;
    description: string;
    price: number;
    images: File[] | string[];
    city: string;
    address?: string;
    sellerName: string;
    sellerEmail: string;
    sellerPhone: string;
    condition?: string;
    // Champs spécifiques selon la catégorie
    [key: string]: any;
}
