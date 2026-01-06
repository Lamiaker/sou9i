import { PrismaClient, FieldType } from "@prisma/client";

const prisma = new PrismaClient();

// Types pour les champs dynamiques
interface DynamicFieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    placeholder?: string;
    required: boolean;
    options?: string[];
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
}

interface SubcategoryFieldsConfig {
    [subcategorySlug: string]: DynamicFieldDefinition[];
}

// Configuration des champs dynamiques par sous-catégorie
// Les slugs sont normalisés (sans accents, sans caractères spéciaux)
const dynamicFieldsConfig: SubcategoryFieldsConfig = {
    // ============================================
    // CUISINE & PÂTISSERIE MAISON
    // ============================================
    "cuisine-patisserie-maison-gateaux-traditionnels": [
        { name: "type_prix", label: "Type de tarification", type: "SELECT", required: true, options: ["Prix par pièce", "Prix au kg"] },
        { name: "lactose", label: "Lactose", type: "SELECT", required: true, options: ["Avec lactose", "Sans lactose"] },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Non disponible"] },
    ],
    "cuisine-patisserie-maison-gateaux-modernes-evenements": [
        { name: "type_prix", label: "Type de tarification", type: "SELECT", required: true, options: ["Prix par pièce", "Prix au kg"] },
        { name: "lactose", label: "Lactose", type: "SELECT", required: true, options: ["Avec lactose", "Sans lactose"] },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Non disponible"] },
    ],
    "cuisine-patisserie-maison-patisserie-orientale": [
        { name: "type_prix", label: "Type de tarification", type: "SELECT", required: true, options: ["Prix par pièce", "Prix au kg"] },
        { name: "lactose", label: "Lactose", type: "SELECT", required: true, options: ["Avec lactose", "Sans lactose"] },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Non disponible"] },
    ],
    "cuisine-patisserie-maison-chocolats-et-confiseries": [
        { name: "type_produit", label: "Type de produit", type: "SELECT", required: true, options: ["Chocolats", "Bonbons", "Pralinés", "Dragées", "Nougat", "Assortiment"] },
        { name: "type_prix", label: "Type de tarification", type: "SELECT", required: true, options: ["Prix par pièce", "Prix au kg", "Prix par coffret"] },
        { name: "fait_maison", label: "Fait maison", type: "BOOLEAN", required: true },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Non disponible"] },
    ],
    "cuisine-patisserie-maison-plats-faits-maison": [
        { name: "type_plat", label: "Type de plat", type: "SELECT", required: true, options: ["Couscous", "Tajine", "Rechta", "Chakhchoukha", "Bourek", "Chorba", "Autre"] },
        { name: "pour_personnes", label: "Pour combien de personnes", type: "SELECT", required: true, options: ["1-2 personnes", "3-4 personnes", "5-8 personnes", "10+ personnes"] },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Retrait sur place", "Les deux"] },
        { name: "commande_avance", label: "Délai de commande", type: "SELECT", required: true, options: ["Sans délai", "24h à l'avance", "48h à l'avance", "Plus"] },
    ],
    "cuisine-patisserie-maison-catering-commandes-evenements": [
        { name: "type_evenement", label: "Type d'événement", type: "MULTISELECT", required: true, options: ["Mariage", "Baby-shower", "Khitane", "Anniversaire", "Autre"] },
        { name: "min_personnes", label: "Minimum de personnes", type: "NUMBER", required: true, placeholder: "Ex: 20", minValue: 1 },
        { name: "max_personnes", label: "Maximum de personnes", type: "NUMBER", required: false, placeholder: "Ex: 200" },
        { name: "service_inclus", label: "Service inclus", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // BEAUTÉ & BIEN-ÊTRE
    // ============================================
    "beaute-bien-etre-coiffure-et-soins-capillaire": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Lissage", "Coloration", "Coupe", "Kératine", "Brushing", "Soins"] },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En salon", "Les deux"] },
        { name: "frais_deplacement", label: "Frais de déplacement", type: "SELECT", required: true, options: ["Inclus", "En supplément", "Non applicable"] },
    ],
    "beaute-bien-etre-maquillage-et-make-up": [
        { name: "type_maquillage", label: "Type de maquillage", type: "SELECT", required: true, options: ["Naturel", "Glamour", "Mariée", "Soirée", "Artistique"] },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En salon", "Les deux"] },
    ],
    "beaute-bien-etre-soins-visage": [
        { name: "type_soin", label: "Type de soin", type: "SELECT", required: true, options: ["Nettoyage profond", "Hydratation", "Anti-âge", "Traitement acné"] },
        { name: "type_peau", label: "Type de peau", type: "SELECT", required: true, options: ["Tous types", "Peau grasse", "Peau sèche", "Peau mixte", "Peau sensible"] },
    ],
    "beaute-bien-etre-soins-corps": [
        { name: "type_soin", label: "Types de soins", type: "MULTISELECT", required: true, options: ["Massage", "Gommage", "Enveloppement", "Hammam", "Autre"] },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En institut", "Les deux"] },
    ],
    "beaute-bien-etre-onglerie": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Pose gel", "Pose capsules", "Manucure", "Pédicure", "Nail art", "Semi-permanent"] },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En salon", "Les deux"] },
    ],
    "beaute-bien-etre-epilation": [
        { name: "technique", label: "Technique", type: "SELECT", required: true, options: ["Cire", "Fil", "Sucre (halawa)", "Autre"] },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En salon", "Les deux"] },
    ],
    "beaute-bien-etre-parfums-et-cosmetiques": [
        { name: "type_produit", label: "Type de produit", type: "SELECT", required: true, options: ["Parfum", "Maquillage", "Soin peau", "Soin cheveux", "Autre"] },
        { name: "original", label: "Authenticité", type: "SELECT", required: true, options: ["Original", "Inspiré", "Non précisé"] },
    ],
    "beaute-bien-etre-produits-naturels-artisanaux": [
        { name: "type_produit", label: "Type de produit", type: "SELECT", required: true, options: ["Huiles", "Savons", "Masques", "Crèmes", "Autre"] },
        { name: "fait_main", label: "Fait main", type: "BOOLEAN", required: true },
        { name: "bio", label: "Bio", type: "SELECT", required: true, options: ["Bio certifié", "Naturel", "Non précisé"] },
    ],

    // ============================================
    // MODE & ACCESSOIRES
    // ============================================
    "mode-accessoires-vetements-femme": [
        { name: "taille", label: "Taille", type: "SELECT", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "Taille unique"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf avec étiquette", "Neuf sans étiquette", "Très bon état", "Bon état"] },
        { name: "livraison", label: "Livraison", type: "SELECT", required: true, options: ["Livraison disponible", "Non disponible"] },
    ],
    "mode-accessoires-robes-et-tenues-traditionnelles": [
        { name: "type_tenue", label: "Type de tenue", type: "SELECT", required: true, options: ["Karakou", "Caftan", "Tesdira", "Fergani", "Chedda", "Blousa", "Autre"] },
        { name: "taille", label: "Taille", type: "SELECT", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "Sur mesure"] },
        { name: "vente_location", label: "Vente ou Location", type: "SELECT", required: true, options: ["Vente uniquement", "Location uniquement", "Vente et location"] },
        { name: "accessoires_inclus", label: "Accessoires inclus", type: "BOOLEAN", required: true },
    ],
    "mode-accessoires-chaussures-femme": [
        { name: "pointure", label: "Pointure", type: "SELECT", required: true, options: ["35", "36", "37", "38", "39", "40", "41", "42"] },
        { name: "type_chaussure", label: "Type de chaussure", type: "SELECT", required: true, options: ["Talons", "Plates", "Sport", "Sandales", "Bottes", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],
    "mode-accessoires-sacs-et-maroquinerie": [
        { name: "type_sac", label: "Type de sac", type: "SELECT", required: true, options: ["Sac à main", "Besace", "Pochette", "Sac à dos", "Autre"] },
        { name: "matiere", label: "Matière", type: "SELECT", required: true, options: ["Cuir véritable", "Similicuir", "Tissu", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],
    "mode-accessoires-bijoux": [
        { name: "type_bijou", label: "Type de bijou", type: "SELECT", required: true, options: ["Collier", "Bracelet", "Boucles d'oreilles", "Bague", "Parure complète", "Autre"] },
        { name: "matiere", label: "Matière", type: "SELECT", required: true, options: ["Or", "Argent", "Plaqué or", "Fantaisie", "Acier inoxydable"] },
    ],
    "mode-accessoires-accessoires": [
        { name: "type_accessoire", label: "Type d'accessoire", type: "SELECT", required: true, options: ["Foulard", "Ceinture", "Lunettes", "Chapeau", "Écharpe", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],
    "mode-accessoires-couture-et-retouches": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Ourlet", "Ajustement", "Création sur mesure", "Réparation", "Autre"] },
        { name: "delai_jours", label: "Délai (jours)", type: "NUMBER", required: true, placeholder: "Ex: 3", minValue: 1 },
        { name: "a_domicile", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En atelier", "Les deux"] },
    ],

    // ============================================
    // DÉCORATION & ÉVÉNEMENTIEL
    // ============================================
    "decoration-evenementiel-decoration-de-fetes": [
        { name: "type_fete", label: "Type de fête", type: "SELECT", required: true, options: ["Anniversaire", "Baby-shower", "Gender reveal", "Fiançailles", "Autre"] },
        { name: "installation", label: "Installation", type: "SELECT", required: true, options: ["Installation incluse", "Installation en supplément", "Sans installation"] },
        { name: "location_vente", label: "Vente ou Location", type: "SELECT", required: true, options: ["Vente", "Location", "Les deux"] },
    ],
    "decoration-evenementiel-decoration-mariages": [
        { name: "style", label: "Style", type: "SELECT", required: true, options: ["Traditionnel", "Moderne", "Bohème", "Luxe", "Autre"] },
        { name: "installation", label: "Installation", type: "SELECT", required: true, options: ["Installation incluse", "Installation en supplément", "Sans installation"] },
        { name: "lieu", label: "Lieu", type: "SELECT", required: true, options: ["Salle", "Domicile", "Extérieur", "Tous lieux"] },
    ],
    "decoration-evenementiel-decoration-anniversaires": [
        { name: "tranche_age", label: "Tranche d'âge", type: "SELECT", required: true, options: ["Enfant (1-12 ans)", "Ado (13-17 ans)", "Adulte (18+)"] },
        { name: "theme", label: "Thème", type: "TEXT", required: false, placeholder: "Ex: Princesse, Super-héros..." },
        { name: "installation", label: "Installation", type: "SELECT", required: true, options: ["Installation incluse", "Installation en supplément", "Sans installation"] },
    ],
    "decoration-evenementiel-ballons-et-arches": [
        { name: "type_ballon", label: "Type de ballon", type: "SELECT", required: true, options: ["Latex", "Hélium", "LED", "Chiffres/Lettres", "Mix"] },
        { name: "livraison_gonfles", label: "Livraison", type: "SELECT", required: true, options: ["Livraison gonflés", "Livraison dégonflés", "Les deux"] },
    ],
    "decoration-evenementiel-location-materiel-deco": [
        { name: "type_materiel", label: "Types de matériel", type: "MULTISELECT", required: true, options: ["Tables", "Chaises", "Arche", "Photobooth", "Vaisselle", "Autre"] },
        { name: "duree_location", label: "Durée de location", type: "SELECT", required: true, options: ["1 jour", "2-3 jours", "1 semaine", "À définir"] },
        { name: "caution", label: "Caution", type: "SELECT", required: true, options: ["Caution requise", "Sans caution"] },
    ],
    "decoration-evenementiel-organisation-d-evenements": [
        { name: "type_evenement", label: "Types d'événement", type: "MULTISELECT", required: true, options: ["Mariage", "Anniversaire", "Baby-shower", "Corporate", "Autre"] },
        { name: "services_inclus", label: "Services inclus", type: "TEXTAREA", required: true, placeholder: "Détaillez les services inclus..." },
        { name: "coordination_jour_j", label: "Coordination le jour J", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // MARIAGE & FIANÇAILLES
    // ============================================
    "mariage-fiancailles-tenues-de-mariee": [
        { name: "type_tenue", label: "Type de tenue", type: "SELECT", required: true, options: ["Robe blanche", "Karakou", "Caftan", "Tesdira", "Chedda", "Autre"] },
        { name: "taille", label: "Taille", type: "SELECT", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "Sur mesure"] },
        { name: "vente_location", label: "Vente ou Location", type: "SELECT", required: true, options: ["Vente uniquement", "Location uniquement", "Vente et location"] },
        { name: "accessoires_inclus", label: "Accessoires inclus", type: "BOOLEAN", required: true },
    ],
    "mariage-fiancailles-negafa-et-accessoires": [
        { name: "style", label: "Style", type: "SELECT", required: true, options: ["Algérois", "Oranais", "Constantinois", "Tlemcenien", "Autre"] },
        { name: "nombre_tenues", label: "Nombre de tenues", type: "NUMBER", required: true, placeholder: "Ex: 3", minValue: 1 },
        { name: "deplacement_inclus", label: "Déplacement inclus", type: "BOOLEAN", required: true },
        { name: "maquillage_inclus", label: "Maquillage inclus", type: "BOOLEAN", required: true },
    ],
    "mariage-fiancailles-maquillage-et-coiffure-mariage": [
        { name: "services", label: "Services", type: "SELECT", required: true, options: ["Maquillage seul", "Coiffure seule", "Maquillage + Coiffure"] },
        { name: "essai_inclus", label: "Essai inclus", type: "BOOLEAN", required: true },
        { name: "deplacement", label: "Lieu de prestation", type: "SELECT", required: true, options: ["À domicile", "En salon", "Les deux"] },
        { name: "retouches_jour_j", label: "Retouches le jour J", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // ARTISANAT & CRÉATIONS
    // ============================================
    "artisanat-creations-handmade-fait-main": [
        { name: "type_creation", label: "Types de création", type: "MULTISELECT", required: true, options: ["Décoration", "Accessoire", "Vêtement", "Cadeau", "Autre"] },
        { name: "personnalisable", label: "Personnalisable", type: "BOOLEAN", required: true },
        { name: "delai_fabrication", label: "Délai de fabrication", type: "SELECT", required: true, options: ["1-3 jours", "4-7 jours", "1-2 semaines", "Plus de 2 semaines"] },
    ],
    "artisanat-creations-broderie": [
        { name: "type_broderie", label: "Types de broderie", type: "MULTISELECT", required: true, options: ["Point de croix", "Fetla", "Medjboud", "Broderie machine", "Autre"] },
        { name: "support", label: "Support", type: "SELECT", required: true, options: ["Tissu seul", "Vêtement", "Cadre", "Accessoire", "Autre"] },
        { name: "sur_mesure", label: "Sur mesure", type: "BOOLEAN", required: true },
    ],
    "artisanat-creations-crochet-et-tricot": [
        { name: "type_article", label: "Type d'article", type: "SELECT", required: true, options: ["Pull", "Couverture", "Accessoire", "Décoration", "Vêtement bébé", "Autre"] },
        { name: "couleur_au_choix", label: "Couleur au choix", type: "BOOLEAN", required: true },
        { name: "taille", label: "Taille", type: "SELECT", required: true, options: ["Bébé", "Enfant", "Adulte", "Taille unique", "Sur mesure"] },
    ],
    "artisanat-creations-bougies-artisanales": [
        { name: "type_bougie", label: "Type de bougie", type: "SELECT", required: true, options: ["Parfumée", "Décorative", "LED", "Massage", "Autre"] },
        { name: "parfum", label: "Parfum", type: "TEXT", required: false, placeholder: "Ex: Vanille, Lavande..." },
        { name: "personnalisable", label: "Personnalisable", type: "BOOLEAN", required: true },
    ],
    "artisanat-creations-resine-et-creations-personnalisees": [
        { name: "type_creation", label: "Types de création", type: "MULTISELECT", required: true, options: ["Bijou", "Porte-clé", "Cadre", "Plateau", "Sous-verre", "Autre"] },
        { name: "inclusion", label: "Inclusion", type: "SELECT", required: true, options: ["Photo", "Fleurs séchées", "Paillettes", "Texte", "Autre", "Aucune"] },
        { name: "delai", label: "Délai de fabrication", type: "SELECT", required: true, options: ["1-3 jours", "4-7 jours", "1-2 semaines", "Plus de 2 semaines"] },
    ],
    "artisanat-creations-cadeaux-personnalises": [
        { name: "type_cadeau", label: "Type de cadeau", type: "SELECT", required: true, options: ["Mug", "Coussin", "Tableau", "T-shirt", "Album", "Autre"] },
        { name: "personnalisation", label: "Personnalisation", type: "SELECT", required: true, options: ["Texte", "Photo", "Les deux"] },
        { name: "emballage_cadeau", label: "Emballage cadeau", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // MAMAN & ENFANTS
    // ============================================
    "maman-enfants-vetements-bebe-et-enfant": [
        { name: "tranche_age", label: "Tranche d'âge", type: "SELECT", required: true, options: ["0-3 mois", "3-6 mois", "6-12 mois", "1-2 ans", "2-4 ans", "4-6 ans", "6-10 ans", "10+ ans"] },
        { name: "sexe", label: "Sexe", type: "SELECT", required: true, options: ["Fille", "Garçon", "Mixte"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf avec étiquette", "Neuf sans étiquette", "Très bon état", "Bon état"] },
    ],
    "maman-enfants-accessoires-bebe": [
        { name: "type_accessoire", label: "Type d'accessoire", type: "SELECT", required: true, options: ["Poussette", "Siège auto", "Parc", "Lit", "Transat", "Chaise haute", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
        { name: "marque", label: "Marque", type: "TEXT", required: false, placeholder: "Ex: Chicco, Bébé Confort..." },
    ],
    "maman-enfants-jouets-educatifs": [
        { name: "tranche_age", label: "Tranche d'âge", type: "SELECT", required: true, options: ["0-1 an", "1-3 ans", "3-6 ans", "6-10 ans", "10+ ans"] },
        { name: "type_jouet", label: "Type de jouet", type: "SELECT", required: true, options: ["Éveil", "Puzzle", "Construction", "Créatif", "Montessori", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],
    "maman-enfants-articles-maternite": [
        { name: "type_article", label: "Type d'article", type: "SELECT", required: true, options: ["Vêtement grossesse", "Coussin allaitement", "Tire-lait", "Ceinture", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],

    // ============================================
    // MAISON & LIFESTYLE
    // ============================================
    "maison-lifestyle-decoration-maison": [
        { name: "style", label: "Style", type: "SELECT", required: true, options: ["Moderne", "Bohème", "Traditionnel", "Minimaliste", "Industriel", "Autre"] },
        { name: "piece", label: "Pièce", type: "SELECT", required: true, options: ["Salon", "Chambre", "Cuisine", "Salle de bain", "Entrée", "Toutes pièces"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état", "Fait main"] },
    ],
    "maison-lifestyle-organisation-interieure": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Tri", "Rangement", "Désencombrement", "Organisation complète"] },
        { name: "lieu", label: "Lieu", type: "SELECT", required: true, options: ["À domicile", "En ligne (conseils)", "Les deux"] },
        { name: "duree_intervention", label: "Durée d'intervention", type: "SELECT", required: true, options: ["1-2 heures", "Demi-journée", "Journée complète", "Plusieurs jours"] },
    ],
    "maison-lifestyle-produits-menagers-naturels": [
        { name: "type_produit", label: "Type de produit", type: "SELECT", required: true, options: ["Liquide vaisselle", "Lessive", "Désinfectant", "Multi-usage", "Autre"] },
        { name: "bio", label: "Bio", type: "SELECT", required: true, options: ["Bio certifié", "Naturel", "Non précisé"] },
        { name: "contenance", label: "Contenance", type: "TEXT", required: true, placeholder: "Ex: 500ml, 1L..." },
    ],
    "maison-lifestyle-linge-de-maison": [
        { name: "type_linge", label: "Type de linge", type: "SELECT", required: true, options: ["Draps", "Serviettes", "Nappe", "Rideaux", "Coussins", "Autre"] },
        { name: "matiere", label: "Matière", type: "SELECT", required: true, options: ["Coton", "Lin", "Satin", "Polyester", "Autre"] },
        { name: "etat", label: "État", type: "SELECT", required: true, options: ["Neuf", "Très bon état", "Bon état"] },
    ],
    "maison-lifestyle-objets-design-et-cadeaux": [
        { name: "type_objet", label: "Type d'objet", type: "SELECT", required: true, options: ["Vase", "Cadre", "Bougeoir", "Miroir", "Horloge", "Autre"] },
        { name: "artisanal", label: "Artisanal / Fait main", type: "BOOLEAN", required: true },
        { name: "personnalisable", label: "Personnalisable", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // SERVICES & FREELANCE
    // ============================================
    "services-freelance-community-management": [
        { name: "plateformes", label: "Plateformes", type: "MULTISELECT", required: true, options: ["Instagram", "Facebook", "TikTok", "LinkedIn", "YouTube", "Autre"] },
        { name: "type_tarif", label: "Type de tarif", type: "SELECT", required: true, options: ["Forfait mensuel", "À la prestation", "À l'heure"] },
        { name: "creation_contenu", label: "Création de contenu incluse", type: "BOOLEAN", required: true },
    ],
    "services-freelance-creation-de-contenu": [
        { name: "type_contenu", label: "Types de contenu", type: "MULTISELECT", required: true, options: ["Photo", "Vidéo", "Rédaction", "Graphisme"] },
        { name: "niche", label: "Niche / Spécialité", type: "TEXT", required: false, placeholder: "Ex: Mode, Food, Beauté..." },
        { name: "materiel_pro", label: "Matériel professionnel", type: "BOOLEAN", required: true },
    ],
    "services-freelance-design-graphique": [
        { name: "specialite", label: "Spécialités", type: "MULTISELECT", required: true, options: ["Logo", "Flyer", "Packaging", "Réseaux sociaux", "Identité visuelle", "Carte de visite"] },
        { name: "revisions_incluses", label: "Révisions incluses", type: "SELECT", required: true, options: ["1 révision", "2 révisions", "3 révisions", "Illimitées"] },
        { name: "delai_livraison", label: "Délai de livraison", type: "SELECT", required: true, options: ["1-3 jours", "4-7 jours", "1-2 semaines", "Plus de 2 semaines"] },
    ],
    "services-freelance-photographie-feminine": [
        { name: "type_photo", label: "Types de photo", type: "MULTISELECT", required: true, options: ["Portrait", "Maternité", "Mariage", "Événement", "Mode", "Produit"] },
        { name: "lieu", label: "Lieu", type: "SELECT", required: true, options: ["Studio", "Extérieur", "À domicile", "Tous lieux"] },
        { name: "retouches_incluses", label: "Retouches incluses", type: "BOOLEAN", required: true },
        { name: "photos_livrees", label: "Nombre de photos livrées", type: "NUMBER", required: true, placeholder: "Ex: 20", minValue: 1 },
    ],
    "services-freelance-assistance-virtuelle": [
        { name: "services", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Gestion emails", "Planification", "Recherche", "Saisie données", "Transcription", "Traduction"] },
        { name: "disponibilite", label: "Disponibilité", type: "SELECT", required: true, options: ["Temps plein", "Mi-temps", "À la mission", "Flexible"] },
        { name: "langues", label: "Langues", type: "SELECT", required: true, options: ["Français", "Arabe", "Anglais", "Plusieurs langues"] },
    ],

    // ============================================
    // FORMATION & COACHING
    // ============================================
    "formation-coaching-coaching-personnel": [
        { name: "specialite", label: "Spécialités", type: "MULTISELECT", required: true, options: ["Confiance en soi", "Gestion du temps", "Mindset", "Relations", "Carrière", "Autre"] },
        { name: "format", label: "Format", type: "SELECT", required: true, options: ["En ligne", "En présentiel", "Les deux"] },
        { name: "type_accompagnement", label: "Type d'accompagnement", type: "SELECT", required: true, options: ["Séance unique", "Pack séances", "Accompagnement mensuel"] },
        { name: "suivi_inclus", label: "Suivi entre séances", type: "BOOLEAN", required: true },
    ],
    "formation-coaching-coaching-beaute": [
        { name: "theme", label: "Thèmes", type: "MULTISELECT", required: true, options: ["Colorimétrie", "Morphologie", "Style vestimentaire", "Maquillage", "Skincare"] },
        { name: "format", label: "Format", type: "SELECT", required: true, options: ["En ligne", "En présentiel", "Les deux"] },
        { name: "livrable", label: "Livrable", type: "SELECT", required: true, options: ["Guide personnalisé", "Séance pratique", "Les deux"] },
    ],
    "formation-coaching-coaching-business-femmes": [
        { name: "objectif", label: "Objectif", type: "SELECT", required: true, options: ["Lancement activité", "Développement", "Stratégie", "Mindset entrepreneur", "Autre"] },
        { name: "format", label: "Format", type: "SELECT", required: true, options: ["Individuel", "En groupe", "Les deux"] },
        { name: "duree_accompagnement", label: "Durée d'accompagnement", type: "SELECT", required: true, options: ["1 mois", "3 mois", "6 mois", "Sur mesure"] },
    ],
    "formation-coaching-cours-en-ligne": [
        { name: "matiere", label: "Matière / Sujet", type: "TEXT", required: true, placeholder: "Ex: Anglais, Marketing..." },
        { name: "niveau", label: "Niveau", type: "SELECT", required: true, options: ["Débutant", "Intermédiaire", "Avancé", "Tous niveaux"] },
        { name: "format", label: "Format", type: "SELECT", required: true, options: ["Live", "Replay", "Les deux"] },
        { name: "acces_duree", label: "Durée d'accès", type: "SELECT", required: true, options: ["Accès à vie", "1 an", "6 mois", "3 mois"] },
    ],
    "formation-coaching-ateliers-et-workshops": [
        { name: "theme", label: "Thème", type: "TEXT", required: true, placeholder: "Ex: Pâtisserie, Macramé..." },
        { name: "lieu", label: "Lieu", type: "SELECT", required: true, options: ["En ligne", "En présentiel", "Les deux"] },
        { name: "materiel_fourni", label: "Matériel fourni", type: "BOOLEAN", required: true },
        { name: "places_limitees", label: "Places limitées", type: "BOOLEAN", required: true },
    ],

    // ============================================
    // EMPLOI
    // ============================================
    "emploi-offres-d-emploi": [
        { name: "type_contrat", label: "Type de contrat", type: "SELECT", required: true, options: ["CDI", "CDD", "Stage", "Freelance", "Temps partiel", "Autre"] },
        { name: "secteur", label: "Secteur", type: "SELECT", required: true, options: ["Beauté", "Commerce", "Restauration", "Services", "Artisanat", "Digital", "Autre"] },
        { name: "experience_requise", label: "Expérience requise", type: "SELECT", required: true, options: ["Débutant accepté", "1-2 ans", "3-5 ans", "5+ ans"] },
        { name: "horaires", label: "Horaires", type: "SELECT", required: true, options: ["Temps plein", "Temps partiel", "Flexible", "À définir"] },
        { name: "teletravail", label: "Télétravail", type: "SELECT", required: false, options: ["Sur site", "Télétravail", "Hybride"] },
    ],
    "emploi-demandes-d-emploi": [
        { name: "poste_recherche", label: "Poste recherché", type: "TEXT", required: true, placeholder: "Ex: Vendeuse, Assistante..." },
        { name: "secteur", label: "Secteur", type: "SELECT", required: true, options: ["Beauté", "Commerce", "Restauration", "Services", "Artisanat", "Digital", "Autre"] },
        { name: "experience", label: "Expérience", type: "SELECT", required: true, options: ["Débutant", "1-2 ans", "3-5 ans", "5+ ans"] },
        { name: "disponibilite", label: "Disponibilité", type: "SELECT", required: true, options: ["Immédiate", "Sous 1 semaine", "Sous 1 mois", "À définir"] },
        { name: "type_contrat_souhaite", label: "Type de contrat souhaité", type: "SELECT", required: true, options: ["CDI", "CDD", "Stage", "Freelance", "Temps partiel", "Tout type"] },
    ],

    // ============================================
    // SERVICES À DOMICILE
    // ============================================
    "services-domicile-femme-de-menage": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Ménage complet", "Repassage", "Lessive", "Cuisine", "Vaisselle"] },
        { name: "frequence", label: "Fréquence", type: "SELECT", required: true, options: ["Ponctuel", "1x/semaine", "2x/semaine", "Quotidien", "À définir"] },
        { name: "horaires", label: "Horaires", type: "SELECT", required: true, options: ["Matin", "Après-midi", "Journée complète", "Flexible"] },
        { name: "experience", label: "Expérience", type: "SELECT", required: true, options: ["< 1 an", "1-3 ans", "3-5 ans", "5+ ans"] },
        { name: "zone_deplacement", label: "Zone de déplacement", type: "TEXT", required: true, placeholder: "Ex: Alger centre, Bab Ezzouar..." },
    ],
    "services-domicile-garde-d-enfants-nounou": [
        { name: "type_garde", label: "Type de garde", type: "SELECT", required: true, options: ["Temps plein", "Temps partiel", "Occasionnel", "Week-end"] },
        { name: "experience", label: "Expérience", type: "SELECT", required: true, options: ["< 1 an", "1-3 ans", "3-5 ans", "5+ ans"] },
        { name: "tranche_age_enfants", label: "Tranche d'âge des enfants", type: "SELECT", required: true, options: ["0-1 an", "1-3 ans", "3-6 ans", "6+ ans", "Tous âges"] },
        { name: "diplome", label: "Diplôme / Formation", type: "BOOLEAN", required: true },
    ],
    "services-domicile-aide-aux-personnes-agees": [
        { name: "type_service", label: "Services proposés", type: "MULTISELECT", required: true, options: ["Compagnie", "Aide ménage", "Aide repas", "Courses", "Soins"] },
        { name: "experience", label: "Expérience", type: "SELECT", required: true, options: ["< 1 an", "1-3 ans", "3-5 ans", "5+ ans"] },
        { name: "disponibilite", label: "Disponibilité", type: "SELECT", required: true, options: ["Matin", "Après-midi", "Journée", "Nuit", "Flexible"] },
    ],
    "services-domicile-cuisiniere-a-domicile": [
        { name: "type_cuisine", label: "Type de cuisine", type: "SELECT", required: true, options: ["Algérienne", "Orientale", "Internationale", "Tout type"] },
        { name: "frequence", label: "Fréquence", type: "SELECT", required: true, options: ["Ponctuel", "Hebdomadaire", "Quotidien", "Événements"] },
        { name: "repas_evenements", label: "Repas pour événements", type: "BOOLEAN", required: true },
    ],
    "services-domicile-cours-particuliers": [
        { name: "matiere", label: "Matière", type: "TEXT", required: true, placeholder: "Ex: Mathématiques, Français..." },
        { name: "niveau", label: "Niveau", type: "SELECT", required: true, options: ["Primaire", "Moyen", "Lycée", "Universitaire", "Tous niveaux"] },
        { name: "lieu", label: "Lieu", type: "SELECT", required: true, options: ["À domicile", "En ligne", "Les deux"] },
    ],


    // ============================================
    // ANNONCES & AUTRES
    // ============================================
    "annonces-autres-partenariats": [
        { name: "type_partenariat", label: "Type de partenariat", type: "SELECT", required: true, options: ["Collaboration", "Échange de services", "Sponsoring", "Affiliation", "Autre"] },
        { name: "secteur", label: "Secteur d'activité", type: "TEXT", required: true, placeholder: "Ex: Mode, Beauté, Food..." },
        { name: "audience", label: "Audience", type: "SELECT", required: false, options: ["Petite (< 1K)", "Moyenne (1-10K)", "Grande (10K+)", "Non applicable"] },
    ],
    "annonces-autres-offres-speciales": [
        { name: "type_offre", label: "Type d'offre", type: "SELECT", required: true, options: ["Réduction %", "Offre groupée", "Vente flash", "Déstockage", "Autre"] },
        { name: "reduction", label: "Réduction", type: "TEXT", required: true, placeholder: "Ex: -20%, 2+1 gratuit..." },
        { name: "validite", label: "Date de fin de validité", type: "TEXT", required: true, placeholder: "Ex: 31/01/2026" },
    ],
    "annonces-autres-recherches-de-services": [
        { name: "service_recherche", label: "Service recherché", type: "TEXT", required: true, placeholder: "Ex: Coiffeuse à domicile..." },
        { name: "budget_max", label: "Budget maximum (DZD)", type: "NUMBER", required: false, placeholder: "Ex: 5000" },
        { name: "urgence", label: "Urgence", type: "SELECT", required: true, options: ["Standard", "Urgent (< 1 semaine)", "Très urgent (< 3 jours)"] },
    ],
    "annonces-autres-autres": [
        { name: "type_annonce", label: "Type d'annonce", type: "SELECT", required: true, options: ["Information", "Demande", "Proposition", "Autre"] },
        { name: "details", label: "Détails supplémentaires", type: "TEXTAREA", required: false, placeholder: "Précisez votre annonce..." },
    ],
};

async function seedDynamicFields() {
    console.log("🌱 Début du seeding des champs dynamiques...");

    // Récupérer toutes les sous-catégories (celles qui ont un parentId)
    const subcategories = await prisma.category.findMany({
        where: {
            parentId: { not: null }
        },
        select: {
            id: true,
            slug: true,
            name: true
        }
    });

    console.log(`📋 ${subcategories.length} sous-catégories trouvées`);

    // D'abord, supprimer tous les champs dynamiques existants
    await prisma.subcategoryField.deleteMany({});
    console.log("🗑️ Anciens champs supprimés");

    let totalFieldsCreated = 0;
    let subcategoriesProcessed = 0;
    let subcategoriesWithoutFields: string[] = [];

    for (const subcategory of subcategories) {
        const fieldsConfig = dynamicFieldsConfig[subcategory.slug];

        if (fieldsConfig && fieldsConfig.length > 0) {
            // Créer les nouveaux champs
            for (let i = 0; i < fieldsConfig.length; i++) {
                const field = fieldsConfig[i];

                await prisma.subcategoryField.create({
                    data: {
                        categoryId: subcategory.id,
                        name: field.name,
                        label: field.label,
                        type: field.type,
                        placeholder: field.placeholder || null,
                        required: field.required,
                        order: i,
                        options: field.options ?? undefined,
                        minValue: field.minValue || null,
                        maxValue: field.maxValue || null,
                        minLength: field.minLength || null,
                        maxLength: field.maxLength || null,
                    }
                });

                totalFieldsCreated++;
            }

            console.log(`✅ ${subcategory.name}: ${fieldsConfig.length} champs`);
            subcategoriesProcessed++;
        } else {
            subcategoriesWithoutFields.push(subcategory.name);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✅ Seeding terminé !`);
    console.log(`   📁 ${subcategoriesProcessed} sous-catégories avec champs`);
    console.log(`   📝 ${totalFieldsCreated} champs dynamiques créés`);

    if (subcategoriesWithoutFields.length > 0) {
        console.log(`   ⚠️ ${subcategoriesWithoutFields.length} sous-catégories sans champs:`);
        subcategoriesWithoutFields.forEach(name => console.log(`      - ${name}`));
    }
    console.log("=".repeat(50));
}

seedDynamicFields()
    .catch((e) => {
        console.error("❌ Erreur lors du seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
