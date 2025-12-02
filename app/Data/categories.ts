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

export const categories: Categorie[] = [
  {
    name: "Gâteaux & Pâtisserie",
    link: "/gateaux",
    image: "https://images.unsplash.com/photo-1587241321921-9ac58f433800?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Gâteaux traditionnels",
        items: ["Makrout", "Baklawa", "Ghribia", "Kefta", "Autres"]
      },
      {
        titre: "Gâteaux modernes",
        items: ["Cupcakes", "Number Cake", "Layer Cake", "Brownies", "Autres"]
      },
      {
        titre: "Pâtisserie personnalisée",
        items: ["Anniversaires", "Mariages", "Fiançailles", "Baptêmes", "Autres"]
      }
    ]
  },

  {
    name: "Décoration & Événements",
    link: "/decoration",
    image: "https://images.unsplash.com/photo-1519225468063-3f721174a3b2?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Décoration maison",
        items: ["Salons", "Chambres", "Cuisine", "Objets déco", "Artisanat"]
      },
      {
        titre: "Organisation d’événements",
        items: ["Mariage", "Fiançailles", "Baptême", "Anniversaire", "Baby Shower"]
      },
      {
        titre: "Fêtes & accessoires",
        items: ["Ballons", "Fleurs", "Tables décorées", "Backdrops", "Autres"]
      }
    ]
  },

  {
    name: "Mode & Beauté",
    link: "/mode",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Vêtements femmes",
        items: ["Robes", "Djellabas", "Tenues traditionnelles", "Casual", "Sport"]
      },
      {
        titre: "Cosmétiques",
        items: ["Maquillage", "Soins visage", "Corps & cheveux", "Parfums"]
      },
      {
        titre: "Accessoires",
        items: ["Sacs", "Bijoux", "Montres", "Voiles", "Chaussures"]
      }
    ]
  },

  {
    name: "Bébé & Enfants",
    link: "/bebes",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Vêtements enfants",
        items: ["Garçon", "Fille", "Bébés", "Tenues spéciales"]
      },
      {
        titre: "Articles bébé",
        items: ["Poussettes", "Lits", "Turbulettes", "Tapis d’éveil"]
      },
      {
        titre: "Événements enfants",
        items: ["Décorations", "Gâteaux thème", "Animatrices"]
      }
    ]
  },

  {
    name: "Services Femmes",
    link: "/services",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Beauté & soins",
        items: ["Coiffure", "Make-up", "Ongles", "Esthétique", "Hammam"]
      },
      {
        titre: "Couture & retouches",
        items: ["Couturières", "Tenues sur mesure", "Retouches", "Broderie"]
      },
      {
        titre: "Formations & ateliers",
        items: ["Pâtisserie", "Décoration", "Maquillage", "Couture", "Art"]
      }
    ]
  },

  {
    name: "Maison & Artisanat",
    link: "/maison",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Produits maison",
        items: ["Bougies", "Savons", "Objets décoratifs", "Artisanat"]
      },
      {
        titre: "Cuisine maison",
        items: ["Plats cuisinés", "Conserves", "Confitures", "Epices maison"]
      }
    ]
  },

  {
    name: "Aides & Petites Annonces",
    link: "/annonces",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
    sousCategories: [
      {
        titre: "Échanges & dons",
        items: ["Vêtements", "Accessoires", "Articles bébé", "Divers"]
      },
      {
        titre: "Petites annonces",
        items: ["Divers", "Matériel", "Autres"]
      }
    ]
  },

  {
    name: "Autres",
    sousCategories: []
  }
];

export default categories;