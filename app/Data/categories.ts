// categories.ts

// Interfaces
import { Categorie } from "./types";

// Données
export const categories: Categorie[] = [
  {
    name: "Immobilier",
    sousCategories: [
      { titre: "Tout Immobilier", items: [] },
      {
        titre: "Ventes immobilières",
        items: ["Appartement", "Maison", "Terrain", "Voir tout"],
      },
      {
        titre: "Immobilier Neuf",
        items: [
          "Appartement",
          "Maison",
          "Programmes logements neufs",
          "Promoteurs immobiliers",
        ],
      },
      {
        titre: "Locations",
        items: ["Appartement", "Maison", "Parking", "Voir tout"],
      },
      { titre: "Colocations", items: [] },
      { titre: "Bureaux & Commerces", items: [] },
      { titre: "Services de déménagement", items: [] },
    ],
  },
  {
    name: "Véhicules",
    sousCategories: [
      { titre: "Voitures", items: [] },
      { titre: "Motos", items: [] },
      { titre: "Caravaning", items: [] },
      { titre: "Utilitaires", items: [] },
      { titre: "Équipement Auto", items: [] },
      { titre: "Équipement Moto", items: [] },
      { titre: "Équipement Caravaning", items: [] },
      { titre: "Nautisme", items: [] },
      { titre: "Équipement Nautisme", items: [] },
    ],
  },
  { name: "Vacances", sousCategories: [] },
  { name: "Emploi", sousCategories: [] },
  { name: "Mode", sousCategories: [] },
  { name: "Maison & Jardin", sousCategories: [] },
  { name: "Famille", sousCategories: [] },
  { name: "Électronique", sousCategories: [] },
  { name: "Loisirs", sousCategories: [] },
  { name: "Bons plans !", sousCategories: [] },
  { name: "Autres", sousCategories: [] },
];

export default categories;