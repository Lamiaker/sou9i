/**
 * Utilitaires de revalidation du cache Next.js
 * 
 * Ce fichier centralise toutes les fonctions de revalidation pour assurer
 * une cohérence dans l'invalidation du cache après les actions admin.
 */

import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Revalide les pages publiques liées aux annonces
 * À appeler après création, modification, approbation ou suppression d'une annonce
 */
export function revalidateAdsPages(adId?: string, categorySlug?: string) {
    // Tag global des annonces
    revalidateTag('ads', 'default');

    // Homepage (affiche les annonces récentes)
    revalidatePath('/');

    // Page catégories principale
    revalidatePath('/categories');

    // Toutes les pages de catégories dynamiques
    revalidatePath('/categories/[slug]', 'page');

    // Page de recherche
    revalidatePath('/search');

    // Page spécifique de l'annonce si fournie
    if (adId) {
        revalidatePath(`/annonces/${adId}`);
    }

    // Page spécifique de la catégorie si fournie
    if (categorySlug) {
        revalidatePath(`/categories/${categorySlug}`);
    }

    // Dashboard utilisateur
    revalidatePath('/dashboard/annonces');
    revalidatePath('/deposer');

    // Admin panel
    revalidatePath('/sl-panel-9x7k/ads');
    revalidatePath('/sl-panel-9x7k');
}

/**
 * Revalide les pages liées aux catégories
 * À appeler après création, modification ou suppression d'une catégorie
 */
export function revalidateCategoryPages(slug?: string) {
    // Tag global des catégories
    revalidateTag('categories', 'default');

    // Homepage (affiche les catégories)
    revalidatePath('/');

    // Page catégories principale
    revalidatePath('/categories');

    // Page de dépôt
    revalidatePath('/deposer');

    // Toutes les pages de catégories dynamiques
    revalidatePath('/categories/[slug]', 'page');

    // Page spécifique si fournie
    if (slug) {
        revalidatePath(`/categories/${slug}`);
    }

    // Admin panel
    revalidatePath('/sl-panel-9x7k/categories');
}

/**
 * Revalide les pages liées aux utilisateurs
 * À appeler après modification du statut d'un utilisateur (ban, vérification, etc.)
 */
export function revalidateUserPages(userId?: string) {
    // Tag global des utilisateurs
    revalidateTag('users', 'default');

    // Les annonces de cet utilisateur peuvent être affectées
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/categories/[slug]', 'page');

    // Admin panel
    revalidatePath('/sl-panel-9x7k/users');
    revalidatePath('/sl-panel-9x7k');

    // Dashboard utilisateur (si l'utilisateur est connecté)
    if (userId) {
        revalidatePath('/dashboard');
    }
}

/**
 * Revalide les pages liées aux signalements
 * À appeler après création ou résolution d'un signalement
 */
export function revalidateReportPages() {
    // Admin panel - toutes les pages de signalements
    revalidatePath('/sl-panel-9x7k/reports');
    revalidatePath('/sl-panel-9x7k/reports/resolved');
    revalidatePath('/sl-panel-9x7k/reports/rejected');
    revalidatePath('/sl-panel-9x7k/reports/all');
    revalidatePath('/sl-panel-9x7k/ads');
    revalidatePath('/sl-panel-9x7k/users');
    revalidatePath('/sl-panel-9x7k');
}

/**
 * Revalide les pages liées au support
 * À appeler après création ou mise à jour d'un ticket
 */
export function revalidateSupportPages() {
    // Dashboard utilisateur
    revalidatePath('/dashboard/support');
    revalidatePath('/dashboard/support/mes-demandes');

    // Admin panel
    revalidatePath('/sl-panel-9x7k/support');
    revalidatePath('/sl-panel-9x7k/support/all');
    revalidatePath('/sl-panel-9x7k/support/in-progress');
    revalidatePath('/sl-panel-9x7k/support/resolved');
    revalidatePath('/sl-panel-9x7k/support/closed');
}

/**
 * Revalide toutes les pages publiques
 * À utiliser avec précaution - peut impacter les performances
 */
export function revalidateAllPublicPages() {
    revalidateTag('ads', 'default');
    revalidateTag('categories', 'default');
    revalidatePath('/');
    revalidatePath('/categories');
    revalidatePath('/categories/[slug]', 'page');
    revalidatePath('/annonces/[id]', 'page');
    revalidatePath('/search');
}
