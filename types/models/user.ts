// ============================================
// Types liés aux Utilisateurs
// Types pour l'affichage frontend des profils utilisateurs
// ============================================

/**
 * Représentation d'un utilisateur pour l'affichage frontend.
 * Utilisé pour les profils, avatars et informations de contact.
 * 
 * @example
 * ```tsx
 * const user: User = {
 *   id: "user123",
 *   name: "Mohamed Ben Ali",
 *   email: "mohamed@example.com",
 *   location: "Casablanca"
 * }
 * ```
 */
export interface User {
    /** Identifiant unique de l'utilisateur (CUID) */
    id: string
    /** Nom complet de l'utilisateur */
    name: string
    /** Adresse email */
    email: string
    /** Numéro de téléphone (format: +212 6XX XXX XXX) */
    phone?: string
    /** URL de la photo de profil */
    avatar?: string
    /** Ville ou région de l'utilisateur */
    location?: string
    /** Date d'inscription formatée (ex: "Membre depuis janvier 2024") */
    memberSince?: string
    /** Indique si le compte est vérifié */
    verified?: boolean
}

/**
 * Extension du type User pour représenter un vendeur.
 * Inclut les statistiques et informations commerciales.
 * 
 * @example
 * ```tsx
 * <SellerCard seller={seller} />
 * ```
 */
export interface Seller extends User {
    /** Note moyenne du vendeur (0 à 5 étoiles) */
    rating?: number
    /** Nombre total d'annonces actives */
    totalAds?: number
}

