// ============================================
// Types liés aux Catégories
// ============================================

/**
 * Représentation d'une sous-catégorie
 */
export interface SousCategorie {
    titre: string
    items: string[]
    link?: string
}

/**
 * Représentation d'une catégorie principale
 */
export interface Categorie {
    name: string
    link?: string
    image?: string
    sousCategories: SousCategorie[]
}

/**
 * Représentation d'une tendance (catégorie mise en avant)
 */
export interface Tendance {
    title: string
    img: string
    link?: string
}
