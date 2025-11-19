
import { ImmobilierItem } from "./immobilier";

// Exemples par sous-catégorie
export const immobilierExamples: ImmobilierItem[] = [
  // Tout Immobilier
  {
    id: "1",
    typeBien: "Maison",
    typeTransaction: "Vente",
    surface: 135,
    pieces: 4,
    localisation: { ville: "Oran", codePostal: "31000", adresse: "Rue des Jardins" },
    prix: 28500000,
    description: "Belle maison familiale entièrement rénovée avec jardin privé, proche des commodités.",
    dateConstruction: 2014,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800",
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
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
  },

  // Ventes immobilières – Appartement
  {
    id: "2",
    typeBien: "Appartement",
    typeTransaction: "Vente",
    surface: 85,
    pieces: 3,
    localisation: { ville: "Alger", codePostal: "16000", adresse: "Boulevard Zighout Youcef" },
    prix: 18000000,
    description: "Appartement lumineux, proche des transports et commerces.",
    dateConstruction: 2018,
    images: [
      "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    logementDetails: {
      chambres: 2,
      meuble: true,
      sallesDeBain: 1,
      etage: "3ème",
      ascenseur: true,
      balcon: { present: true, surface: 5 },
      chauffage: "Gaz",
      dpe: "B",
      ges: "C",
    },
  },

  // Immobilier Neuf – Maison
  {
    id: "3",
    typeBien: "Maison",
    typeTransaction: "Vente",
    surface: 120,
    pieces: 4,
    localisation: { ville: "Oran", codePostal: "31000", adresse: "Résidence Neuve" },
    prix: 32000000,
    description: "Maison neuve avec prestations modernes, garage et jardin.",
    dateConstruction: 2023,
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    logementDetails: {
      chambres: 3,
      meuble: false,
      sallesDeBain: 2,
      etage: "RDC",
      ascenseur: false,
      jardin: { present: true, surface: 150 },
      parking: { present: true, places: 2 },
      chauffage: "Individuel",
      dpe: "A",
      ges: "A",
    },
  },

  // Locations – Appartement
  {
    id: "4",
    typeBien: "Appartement",
    typeTransaction: "Location",
    surface: 65,
    pieces: 2,
    localisation: { ville: "Alger", codePostal: "16000", adresse: "Rue de la République" },
    prix: 45000, // en DA / mois
    description: "Appartement meublé, idéal pour un jeune couple.",
    dateConstruction: 2017,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    logementDetails: {
      chambres: 1,
      meuble: true,
      sallesDeBain: 1,
      etage: "2ème",
      ascenseur: true,
      balcon: { present: true, surface: 4 },
      chauffage: "Électrique",
      dpe: "C",
      ges: "D",
    },
  },

  // Locations – Maison
  {
    id: "5",
    typeBien: "Maison",
    typeTransaction: "Location",
    surface: 100,
    pieces: 3,
    localisation: { ville: "Oran", codePostal: "31000", adresse: "Quartier Résidentiel" },
    prix: 60000,
    description: "Maison avec jardin, idéale pour famille.",
    dateConstruction: 2015,
    images: [
      "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800",
    ],
    logementDetails: {
      chambres: 2,
      meuble: false,
      sallesDeBain: 1,
      etage: "RDC",
      ascenseur: false,
      jardin: { present: true, surface: 80 },
      parking: { present: true, places: 1 },
      chauffage: "Gaz",
      dpe: "D",
      ges: "E",
    },
  },

  // Locations – Parking
  {
    id: "6",
    typeBien: "Parking",
    typeTransaction: "Location",
    surface: 15,
    pieces: 1,
    localisation: { ville: "Alger", codePostal: "16000" },
    prix: 10000,
    description: "Place de parking sécurisée en centre-ville.",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    ],
    logementDetails: undefined,
  },

  // Bureaux & Commerces – Local Commercial
  {
    id: "7",
    typeBien: "Local commercial",
    typeTransaction: "Vente",
    surface: 200,
    pieces: 5,
    localisation: { ville: "Oran", codePostal: "31000", adresse: "Rue du Commerce" },
    prix: 50000000,
    description: "Local commercial spacieux, idéal pour boutique ou bureau.",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    ],
    localDetails: {
      typeLocal: "Boutique",
      chargesMensuelles: 20000,
    },
  },
];

export default immobilierExamples;
