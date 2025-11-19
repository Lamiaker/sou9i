 interface ClothingAd {
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

export const clothes: ClothingAd[] = [
  {
    id: "1",
    title: "Veste en jean Zara Taille M",
    price: 4500,
    category: "Vêtements",
    type: "Veste",
    size: "M",
    brand: "Zara",
    condition: "Très bon état",
    color: "Bleu",
    material: "Denim",
    description:
      "Veste en jean Zara, coupe moderne, peu portée. Taille M. Très bonne qualité.",
    location: "Oran 31000",
    deliveryMethods: ["Remise en main propre", "Livraison à domicile"],
    publishedAt: "2025-11-17",
   photos: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
  ]
  },
  {
    id: "2",
    title: "Pull en laine H&M Taille L",
    price: 3800,
    category: "Vêtements",
    type: "Pull",
    size: "L",
    brand: "H&M",
    condition: "Comme neuf",
    color: "Gris",
    material: "Laine",
    description:
      "Pull chaud idéal pour l'hiver. Très confortable et presque neuf.",
    location: "Alger 16000",
    deliveryMethods: ["La Poste", "Remise en main propre"],
    publishedAt: "2025-11-15",
   photos: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
  ]
  }
];
