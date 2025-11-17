// Types communs pour réutilisation

export interface ProductItem {
  id: string;
  sellerName: string;
  sellerRating: number;
  sellerReviews: number;
  sellerAvatar: string;
  title: string;
  price: string;
  image: string;
  deliveryAvailable: boolean;
  location: string;
  postedTime: string;
}
export interface SectionVetementsProps {
  title?: string;
  viewAllLink?: string;
  products?: ProductItem[];
}
 interface TendanceItem {
  title: string;
  img: string;
}

export interface SectionTendancesProps {
  title: string;
  items: TendanceItem[];
}
export interface SectionMomentDeVendreProps {
  title: string;
  description?: string;
  buttonText: string;
}
 interface SousCategorie {
  titre: string;
  items: string[];
}

export interface Categorie {
  name: string;
  sousCategories: SousCategorie[];
}
export interface ClothingAd {
  id: string;
  title: string;                 // Titre de l'annonce
  price: number;                 // Prix demandé
  category: string;              // Catégorie (Vêtements, Chaussures…)
  type: string;                  // Type de vêtement (Jean, Robe…)
  size: string;                  // Taille (S, M, 38…)
  brand: string;                 // Marque (Zara, Nike…)
  condition: string;             // État du vêtement
  color: string;                 // Couleur
  material: string;              // Matière (Coton…)
  description: string;           // Description détaillée
  location: string;              // Ville + code postal
  deliveryMethods: string[];     // Modes de livraison
  publishedAt: string;           // Date de publication
  photos: string[];              // URLs des images
}
