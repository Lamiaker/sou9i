// ============================================
// Types pour les Hooks React
// Types détaillés correspondant aux réponses API complètes
// ============================================

/**
 * Type complet d'une annonce avec toutes ses relations.
 * Retourné par les APIs `/api/ads` et `/api/ads/[id]`.
 * Utilisé par les hooks `useAd` et `useAds`.
 * 
 * @example
 * ```tsx
 * const { ad, loading } = useAd(adId)
 * if (ad) {
 *   console.log(ad.title, ad.user?.name)
 * }
 * ```
 */
export interface AdWithDetails {
    /** Identifiant unique (CUID) */
    id: string
    /** Titre de l'annonce */
    title: string
    /** Description complète */
    description: string
    /** Prix en DH (nombre, pas formaté) */
    price: number
    /** Ville de publication */
    location: string
    /** URLs des images uploadées */
    images: string[]
    /** État du produit (neuf, occasion, etc.) */
    condition?: string | null
    /** Marque du produit */
    brand?: string | null
    /** Taille (vêtements, chaussures) */
    size?: string | null
    /** Numéro de contact spécifique pour cette annonce */
    contactPhone?: string | null
    /** Statut de l'annonce (active, sold, deleted) */
    status: string
    /** Statut de modération (PENDING, APPROVED, REJECTED) */
    moderationStatus?: string
    /** Raison du rejet si applicable */
    rejectionReason?: string
    /** Nombre total de vues */
    views: number
    /** Livraison disponible */
    deliveryAvailable: boolean
    /** Prix négociable */
    negotiable: boolean
    /** Date de création (ISO string) */
    createdAt: string
    /** Date de dernière mise à jour (ISO string) */
    updatedAt: string
    /** ID de la catégorie */
    categoryId: string
    /** ID du propriétaire */
    userId: string
    /** Catégorie associée */
    category?: {
        id: string
        name: string
        slug: string
    }
    /** Informations du propriétaire */
    user?: {
        id: string
        name: string | null
        avatar: string | null
        city: string | null
        phone: string | null
        isVerified: boolean
        createdAt: string
    }
    /** Compteurs agrégés */
    _count?: {
        /** Nombre de fois en favoris */
        favorites: number
    }
    /** Valeurs des champs dynamiques de la sous-catégorie */
    dynamicFields?: DynamicFieldValue[]
}

/**
 * Valeur d'un champ dynamique associé à une annonce.
 * Les champs dynamiques sont définis par sous-catégorie.
 * 
 * @example
 * ```tsx
 * ad.dynamicFields?.map(field => (
 *   <div key={field.id}>
 *     <strong>{field.field.label}:</strong> {field.value}
 *   </div>
 * ))
 * ```
 */
export interface DynamicFieldValue {
    /** ID de la valeur */
    id: string
    /** Valeur saisie (toujours string, à parser selon le type) */
    value: string
    /** Définition du champ */
    field: {
        id: string
        /** Nom technique du champ */
        name: string
        /** Label affiché à l'utilisateur */
        label: string
        /** Type de champ pour le rendu */
        type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'SELECT' | 'BOOLEAN' | 'IMAGE'
    }
}

/**
 * Filtres pour la recherche d'annonces côté frontend.
 * Utilisé par le hook `useAds` pour filtrer les résultats.
 * 
 * @example
 * ```tsx
 * const { ads } = useAds({
 *   filters: {
 *     categoryId: "cat123",
 *     minPrice: 100,
 *     search: "iphone"
 *   }
 * })
 * ```
 */
export interface AdFiltersUI {
    /** ID de la catégorie */
    categoryId?: string
    /** Prix minimum en DH */
    minPrice?: number
    /** Prix maximum en DH */
    maxPrice?: number
    /** Ville ou région */
    location?: string
    /** État du produit */
    condition?: string
    /** Terme de recherche textuelle */
    search?: string
    /** Statut de l'annonce (active, sold) */
    status?: string
    /** ID de l'utilisateur (pour "mes annonces") */
    userId?: string
    /** Statut de modération (admin) */
    moderationStatus?: string
}

/**
 * Type complet d'une catégorie avec ses relations.
 * Retourné par l'API `/api/categories`.
 * Utilisé par le hook `useCategories`.
 * 
 * @example
 * ```tsx
 * const { categories } = useCategories({ type: 'hierarchy' })
 * categories.map(cat => (
 *   <CategoryCard key={cat.id} category={cat} />
 * ))
 * ```
 */
export interface CategoryWithDetails {
    /** Identifiant unique (CUID) */
    id: string
    /** Nom de la catégorie */
    name: string
    /** Slug URL-friendly */
    slug: string
    /** Emoji ou icône */
    icon?: string | null
    /** URL de l'image de la catégorie */
    image?: string | null
    /** Description de la catégorie */
    description?: string | null
    /** Ordre d'affichage */
    order: number
    /** ID du parent (null si catégorie racine) */
    parentId?: string | null
    /** Date de création (ISO string) */
    createdAt: string
    /** Indique si c'est une catégorie tendance */
    isTrending?: boolean
    /** Ordre d'affichage dans les tendances */
    trendingOrder?: number | null
    /** Catégorie parente (si sous-catégorie) */
    parent?: CategoryWithDetails | null
    /** Sous-catégories */
    children?: CategoryWithDetails[]
    /** Compteurs agrégés */
    _count?: {
        /** Nombre d'annonces dans cette catégorie */
        ads: number
        /** Nombre de sous-catégories */
        children: number
    }
}

/**
 * Informations de pagination retournées par les APIs.
 * 
 * @example
 * ```tsx
 * <Pagination 
 *   current={pagination.page} 
 *   total={pagination.totalPages}
 *   onChange={setPage}
 * />
 * ```
 */
export interface PaginationInfo {
    /** Page courante (1-indexed) */
    page: number
    /** Nombre d'éléments par page */
    limit: number
    /** Nombre total d'éléments */
    total: number
    /** Nombre total de pages */
    totalPages: number
}

/**
 * Options communes pour les hooks de données SWR.
 * Permet de contrôler le chargement et le rafraîchissement.
 * 
 * @example
 * ```tsx
 * const { ads } = useAds({
 *   enabled: isLoggedIn,
 *   refreshInterval: 30000 // 30 secondes
 * })
 * ```
 */
export interface UseDataOptions {
    /** Si false, désactive le chargement automatique */
    enabled?: boolean
    /** Intervalle de rafraîchissement en ms (0 = désactivé) */
    refreshInterval?: number
}

