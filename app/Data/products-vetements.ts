// File: Data/products-vetements.ts

export interface ProductItem {
  id: string;
  sellerName?: string;
  sellerRating?: number;
  sellerReviews?: number;
  sellerAvatar?: string;
  title: string;
  price: string | number;
  photos: string[];
  deliveryAvailable?: boolean;
  location?: string;
  postedTime?: string;
  category?: string;
  type?: string;
  size?: string;
  brand?: string;
  condition?: string;
  color?: string;
  material?: string;
  publishedAt?: string;
  description?: string;
  deliveryMethods: string[];
}

export const vetementsProducts: ProductItem[] = [
  {
    id: "1",
    sellerName: "xuan",
    sellerRating: 4.9,
    sellerReviews: 20,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xuan",
    title: "Pantalon cargo 3-4 ans",
    price: "5 €",
    photos: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "Montreuil 93100",
    postedTime: "aujourd'hui à 13:47",
    publishedAt: "15 Nov 2025",
    category: "Enfant",
    type: "Pantalon",
    size: "3-4 ans",
    brand: "Zara Kids",
    condition: "Neuf",
    color: "Kaki",
    material: "Coton",
    description: "Pantalon cargo confortable pour enfant, idéal pour le quotidien.",
    deliveryMethods: ["Livraison à domicile", "Point relais", "Remise en main propre"]
  },
  {
    id: "2",
    sellerName: "Stevanne",
    sellerRating: 4.9,
    sellerReviews: 57,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=stevanne&backgroundColor=ff6b6b",
    title: "Vend pull femme",
    price: "2 €",
    photos: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "Laval 53000",
    postedTime: "aujourd'hui à 13:47",
    publishedAt: "14 Nov 2025",
    category: "Femme",
    type: "Pull",
    size: "M",
    brand: "H&M",
    condition: "Très bon état",
    color: "Rose",
    material: "Laine",
    description: "Pull doux et chaud, parfait pour l'hiver.",
    deliveryMethods: ["Livraison à domicile", "Point relais"]
  },
  {
    id: "3",
    sellerName: "chrystelle",
    sellerRating: 5,
    sellerReviews: 183,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chrystelle&backgroundColor=4ecdc4",
    title: "Belle robe bustier effet marbre couleur beige ...",
    price: "10 €",
    photos: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "La Ferté-Alais 91590",
    postedTime: "aujourd'hui à 13:47",
    publishedAt: "13 Nov 2025",
    category: "Femme",
    type: "Robe",
    size: "S",
    brand: "Zara",
    condition: "Neuf",
    color: "Beige",
    material: "Coton",
    description: "Robe bustier élégante effet marbre, idéale pour soirées et événements.",
    deliveryMethods: ["Remise en main propre", "Point relais"]
  },
  {
    id: "4",
    sellerName: "Laportas",
    sellerRating: 5,
    sellerReviews: 90,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laportas&backgroundColor=95e1d3",
    title: "Pull / Sweat a col V Ralph Lauren rose ...",
    price: "14 €",
    photos: [
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "Vouneuil-sur-Vienne 86210",
    postedTime: "aujourd'hui à 13:47",
    publishedAt: "12 Nov 2025",
    category: "Homme",
    type: "Pull",
    size: "L",
    brand: "Ralph Lauren",
    condition: "Très bon état",
    color: "Rose",
    material: "Laine",
    description: "Pull col V de qualité, confortable et élégant.",
    deliveryMethods: ["Livraison à domicile"]
  },
  {
    id: "5",
    sellerName: "A-H",
    sellerRating: 5,
    sellerReviews: 1,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ah&backgroundColor=ffd93d",
    title: "Lot 2 bas jogging neuf puma taille L",
    price: "20 €",
    photos: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "Asnières-sur-Seine 92600",
    postedTime: "aujourd'hui à 13:47",
    publishedAt: "11 Nov 2025",
    category: "Homme",
    type: "Jogging",
    size: "L",
    brand: "Puma",
    condition: "Neuf",
    color: "Noir",
    material: "Coton",
    description: "Lot de 2 pantalons de jogging Puma, taille L, neufs.",
    deliveryMethods: ["Livraison à domicile", "Point relais", "Remise en main propre"]
  },
  {
    id: "6",
    sellerName: "Marie",
    sellerRating: 4.8,
    sellerReviews: 45,
    sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie&backgroundColor=c7b3ff",
    title: "Veste en jean vintage",
    price: "15 €",
    photos: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
    ],
    deliveryAvailable: true,
    location: "Paris 75011",
    postedTime: "aujourd'hui à 14:20",
    publishedAt: "10 Nov 2025",
    category: "Femme",
    type: "Veste",
    size: "M",
    brand: "Levi's",
    condition: "Très bon état",
    color: "Bleu denim",
    material: "100% Coton",
    description: "Magnifique veste en jean vintage, portée quelques fois seulement.",
    deliveryMethods: ["Livraison à domicile", "Point relais"]
  }
];

export default vetementsProducts;
