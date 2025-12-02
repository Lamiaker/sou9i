import { ProductItem } from "@/types";

export const gateauxProducts: ProductItem[] = [
    {
        id: "g1",
        sellerName: "Sarah Délices",
        sellerRating: 5.0,
        sellerReviews: 12,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        title: "Plateau Baklawa & Makrout",
        price: "4,500 DZD",
        photos: ["https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&auto=format&fit=crop"],
        location: "Alger",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison", "Main propre"]
    },
    {
        id: "g2",
        sellerName: "Amira Cakes",
        sellerRating: 4.8,
        sellerReviews: 8,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amira",
        title: "Layer Cake Fraise",
        price: "6,000 DZD",
        photos: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"],
        location: "Oran",
        postedTime: "Hier",
        deliveryAvailable: false,
        deliveryMethods: ["Main propre"]
    },
    {
        id: "g3",
        sellerName: "Douceurs d'Orient",
        sellerRating: 4.9,
        sellerReviews: 24,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=douceurs",
        title: "Boîte de 30 pièces Sablés",
        price: "2,500 DZD",
        photos: ["https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800"],
        location: "Blida",
        postedTime: "Il y a 2 jours",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "g4",
        sellerName: "Noura Patisserie",
        sellerRating: 4.7,
        sellerReviews: 15,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=noura",
        title: "Gâteaux Secs Assortis",
        price: "1,800 DZD",
        photos: ["https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800"],
        location: "Constantine",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    }
];

export const decorationProducts: ProductItem[] = [
    {
        id: "d1",
        sellerName: "Deco Events",
        sellerRating: 4.9,
        sellerReviews: 30,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=deco",
        title: "Arche de Ballons Anniversaire",
        price: "15,000 DZD",
        photos: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop"],
        location: "Alger",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Installation"]
    },
    {
        id: "d2",
        sellerName: "Fleurs & Co",
        sellerRating: 5.0,
        sellerReviews: 42,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fleurs",
        title: "Bouquet Mariée Roses Blanches",
        price: "8,000 DZD",
        photos: ["https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&auto=format&fit=crop"],
        location: "Setif",
        postedTime: "Hier",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "d3",
        sellerName: "Home Chic",
        sellerRating: 4.6,
        sellerReviews: 10,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=home",
        title: "Set de Table Macramé",
        price: "3,500 DZD",
        photos: ["https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&auto=format&fit=crop"],
        location: "Oran",
        postedTime: "Il y a 3 jours",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "d4",
        sellerName: "Party Time",
        sellerRating: 4.8,
        sellerReviews: 18,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=party",
        title: "Kit Décoration Baby Shower",
        price: "10,000 DZD",
        photos: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"],
        location: "Alger",
        postedTime: "Il y a 5 heures",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    }
];

export const beauteProducts: ProductItem[] = [
    {
        id: "b1",
        sellerName: "Beauty Shop",
        sellerRating: 4.9,
        sellerReviews: 150,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=beauty",
        title: "Coffret Maquillage Complet",
        price: "12,000 DZD",
        photos: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800"],
        location: "Alger",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "b2",
        sellerName: "Natural Care",
        sellerRating: 5.0,
        sellerReviews: 60,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=natural",
        title: "Huile d'Argan Bio",
        price: "2,500 DZD",
        photos: ["https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop"],
        location: "Tizi Ouzou",
        postedTime: "Hier",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "b3",
        sellerName: "Glamour",
        sellerRating: 4.7,
        sellerReviews: 25,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=glam",
        title: "Parfum Oud Royal",
        price: "9,000 DZD",
        photos: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"],
        location: "Oran",
        postedTime: "Il y a 2 jours",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "b4",
        sellerName: "Nails Art",
        sellerRating: 4.8,
        sellerReviews: 40,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nails",
        title: "Kit Manucure Gel UV",
        price: "5,500 DZD",
        photos: ["https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop"],
        location: "Annaba",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    }
];

export const enfantProducts: ProductItem[] = [
    {
        id: "e1",
        sellerName: "Maman & Bébé",
        sellerRating: 4.9,
        sellerReviews: 80,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maman",
        title: "Poussette Trio Confort",
        price: "35,000 DZD",
        photos: ["https://images.unsplash.com/photo-1601134467661-3d775b999c8b?w=800&auto=format&fit=crop"],
        location: "Alger",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Main propre"]
    },
    {
        id: "e2",
        sellerName: "Kids Store",
        sellerRating: 4.8,
        sellerReviews: 55,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kids",
        title: "Ensemble Hiver Garçon 4 ans",
        price: "4,500 DZD",
        photos: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"],
        location: "Oran",
        postedTime: "Hier",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    },
    {
        id: "e3",
        sellerName: "Baby Love",
        sellerRating: 5.0,
        sellerReviews: 20,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=baby",
        title: "Lit Bébé Bois Massif",
        price: "22,000 DZD",
        photos: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"],
        location: "Blida",
        postedTime: "Il y a 3 jours",
        deliveryAvailable: false,
        deliveryMethods: ["Main propre"]
    },
    {
        id: "e4",
        sellerName: "Jouets & Co",
        sellerRating: 4.7,
        sellerReviews: 35,
        sellerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=toys",
        title: "Tapis d'Éveil Musical",
        price: "5,000 DZD",
        photos: ["https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800"],
        location: "Constantine",
        postedTime: "Aujourd'hui",
        deliveryAvailable: true,
        deliveryMethods: ["Livraison"]
    }
];
