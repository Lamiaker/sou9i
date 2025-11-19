// ============================================
// 🏡 Types Immobilier – Projet Next.js
// ============================================

// Types principaux
export type TypeBien =
  | "Maison"
  | "Appartement"
  | "Terrain"
  | "Local commercial"
  | "Parking"
  | "Box"
  | "Immeuble"
  | "Viager";

export type TypeTransaction = "Vente" | "Location";

// DPE & GES (étiquettes énergie)
export type DPE = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type GES = "A" | "B" | "C" | "D" | "E" | "F" | "G";

// 🧱 ATTRIBUTS SPÉCIFIQUE : Logements (Maison/Appartement)
export interface LogementDetails {
  chambres?: number;
  meuble?: boolean;
  sallesDeBain?: number;
  etage?: string; // Ex: "RDC", "1er", "Dernier"
  ascenseur?: boolean;

  balcon?: {
    present: boolean;
    surface?: number;
  };

  terrasse?: {
    present: boolean;
    surface?: number;
  };

  jardin?: {
    present: boolean;
    surface?: number;
  };

  parking?: {
    present: boolean;
    places?: number;
  };

  chauffage?: "Gaz" | "Électrique" | "Fuel" | "Bois" | "Collectif" | "Individuel";

  dpe?: DPE;
  ges?: GES;
}

// 🌱 ATTRIBUTS SPÉCIFIQUE : Terrain
export interface TerrainDetails {
  surfaceTerrain?: number;
  constructible?: boolean;
}

// 🏢 ATTRIBUTS SPÉCIFIQUE : Locaux
export interface LocalCommercialDetails {
  typeLocal?: "Bureau" | "Entrepôt" | "Boutique" | "Atelier";
  chargesMensuelles?: number;
}

// ============================================
// 📦 Type principal : ImmobilierItem
// ============================================

export interface ImmobilierItem {
  id: string;

  // Obligatoires
  typeBien: TypeBien;
  typeTransaction: TypeTransaction;

  surface: number; // en m²
  pieces: number; // T1, T2, T3 => mettre number

  localisation: {
    ville: string;
    codePostal: string;
    adresse?: string;
  };

  prix: number;

  // Optionnels
  description?: string;
  dateConstruction?: number; // Année
  images: string[];

  // Détails spécifiques
  logementDetails?: LogementDetails;
  terrainDetails?: TerrainDetails;
  localDetails?: LocalCommercialDetails;
}

// ============================================
// 🧪 Exemple pour ta page détail
// ============================================

export const immobilierExample: ImmobilierItem = {
  id: "1",
  typeBien: "Maison",
  typeTransaction: "Vente",

  surface: 135,
  pieces: 4,

  localisation: {
    ville: "Oran",
    codePostal: "31000",
    adresse: "Rue des Jardins",
  },

  prix: 28500000,

  description:
    "Belle maison familiale entièrement rénovée avec jardin privé, proche des commodités. Parfait pour une famille.",

  dateConstruction: 2014,

  images: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    "https://images.unsplash.com/photo-1599423300746-b62533397364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
  ],

  logementDetails: {
    chambres: 3,
    meuble: false,
    sallesDeBain: 2,
    etage: "RDC + 1",
    ascenseur: false,

    terrasse: { present: true, surface: 18 },
    jardin: { present: true, surface: 120 },

    parking: { present: true, places: 1 },

    chauffage: "Électrique",

    dpe: "C",
    ges: "B",
  },
};

