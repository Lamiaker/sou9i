
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



