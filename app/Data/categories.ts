
 interface SousCategorie {
  titre: string;
  items: string[];
}

 interface Categorie {
  name: string;
  link?: string;
  sousCategories: SousCategorie[];
}
export const categories: Categorie[] = [
  {
    name: "Immobilier",
    link: "/immobilier",
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
  { name: "Vacances", sousCategories: [
    { titre: "Voyages", items: [] },
    { titre: "Hotes", items: [] },
    { titre: "Voyages et Hotes", items: [] },
  ] },
  { name: "Emploi", sousCategories: [
    { titre: "Offres d'emploi", items: [] },
    { titre: "Candidatures", items: [] },
  ] },
  { name: "Mode", sousCategories: [
    { titre: "Homme", items: [] },
    { titre: "Femme", items: [] },
    { titre: "Enfants", items: [] },
  ] },
  { name: "Maison & Jardin", sousCategories: [
    { titre: "Maison", items: [] },
    { titre: "Jardin", items: [] },
  ] },
  { name: "Famille", sousCategories: [
    { titre: "Enfants", items: [] },
    { titre: "Famille", items: [] },
    { titre: "Famille & Enfants", items: [] },
  ] },
  { name: "Électronique", sousCategories: [
    { titre: "Ordinateurs", items: [] },
    { titre: "Smartphones", items: [] },
    { titre: "Tablettes", items: [] },
    { titre: "Accessoires", items: [] },
  ] },
  { name: "Loisirs", sousCategories: [
    { titre: "Musique", items: [] },
    { titre: "Loisirs", items: [] },
    { titre: "Loisirs et Musique", items: [] },
  ] },
  { name: "Bons plans !", sousCategories: [
    { titre: "Bons plans", items: [] },
    { titre: "Bons plans et Loisirs", items: [] },
    { titre: "Bons plans et Musique", items: [] },
  ] },
  { name: "Autres", sousCategories: [
    
  ] },
];

export default categories;