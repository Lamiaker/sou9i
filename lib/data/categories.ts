/**
 * Types et utilitaires pour les catégories
 * Les catégories sont chargées dynamiquement depuis l'API
 * Utilisez le hook useCategories() dans vos composants
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  order: number;
  parentId?: string | null;
  createdAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    ads: number;
    children: number;
  };
}

// Fonction utilitaire pour transformer les catégories en format hiérarchique
export function buildCategoryHierarchy(flatCategories: Category[]): Category[] {
  const parents = flatCategories.filter(cat => !cat.parentId);
  const children = flatCategories.filter(cat => cat.parentId);

  return parents.map(parent => ({
    ...parent,
    children: children.filter(child => child.parentId === parent.id),
  }));
}

// Fonction pour trouver une catégorie par slug
export function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  for (const category of categories) {
    if (category.slug === slug) {
      return category;
    }
    if (category.children) {
      const found = findCategoryBySlug(category.children, slug);
      if (found) return found;
    }
  }
  return undefined;
}

// Fonction pour obtenir le chemin complet d'une catégorie
export function getCategoryPath(categories: Category[], categoryId: string): Category[] {
  const path: Category[] = [];

  function findPath(cats: Category[], targetId: string, currentPath: Category[]): boolean {
    for (const cat of cats) {
      const newPath = [...currentPath, cat];

      if (cat.id === targetId) {
        path.push(...newPath);
        return true;
      }

      if (cat.children && findPath(cat.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  }

  findPath(categories, categoryId, []);
  return path;
}

export default Category;