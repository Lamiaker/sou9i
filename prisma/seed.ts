import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

    const categories = [
        {
            name: "Cuisine & Pâtisserie Maison",
            slug: "cuisine-patisserie-maison",
            children: [
                "Gâteaux traditionnels",
                "Gâteaux modernes / événements",
                "Pâtisserie orientale",
                "Chocolats & confiseries",
                "Plats faits maison",
                "Catering / commandes événements"
            ]
        },
        {
            name: "Beauté & Bien-être",
            slug: "beaute-bien-etre",
            children: [
                "Coiffure & soins capillaire",
                "Maquillage & make-up",
                "Soins visage",
                "Soins corps",
                "Onglerie",
                "Épilation",
                "Parfums & cosmétiques",
                "Produits naturels / artisanaux"
            ]
        },
        {
            name: "Mode & Accessoires",
            slug: "mode-accessoires",
            children: [
                "Vêtements femme",
                "Robes & tenues traditionnelles",
                "Chaussures femme",
                "Sacs & maroquinerie",
                "Bijoux",
                "Accessoires",
                "Couture & retouches"
            ]
        },
        {
            name: "Décoration & Événementiel",
            slug: "decoration-evenementiel",
            children: [
                "Décoration de fêtes",
                "Décoration mariages",
                "Décoration anniversaires",
                "Ballons & arches",
                "Location matériel déco",
                "Organisation d'événements"
            ]
        },
        {
            name: "Mariage & Fiançailles",
            slug: "mariage-fiancailles",
            children: [
                "Tenues de mariée",
                "Negafa & accessoires",
                "Maquillage & coiffure mariage"
            ]
        },
        {
            name: "Artisanat & Créations",
            slug: "artisanat-creations",
            children: [
                "Handmade / fait main",
                "Broderie",
                "Crochet & tricot",
                "Bougies artisanales",
                "Résine & créations personnalisées",
                "Cadeaux personnalisés"
            ]
        },
        {
            name: "Maman & Enfants",
            slug: "maman-enfants",
            children: [
                "Vêtements bébé & enfant",
                "Accessoires bébé",
                "Jouets éducatifs",
                "Articles maternité"
            ]
        },
        {
            name: "Maison & Lifestyle",
            slug: "maison-lifestyle",
            children: [
                "Décoration maison",
                "Organisation intérieure",
                "Produits ménagers naturels",
                "Linge de maison",
                "Objets design & cadeaux"
            ]
        },
        {
            name: "Services & Freelance",
            slug: "services-freelance",
            children: [
                "Community management",
                "Création de contenu",
                "Design graphique",
                "Photographie féminine",
                "Assistance virtuelle"
            ]
        },
        {
            name: "Formation & Coaching",
            slug: "formation-coaching",
            children: [
                "Coaching personnel",
                "Coaching beauté",
                "Coaching business femmes",
                "Cours en ligne",
                "Ateliers & workshops"
            ]
        },
        {
            name: "Emploi",
            slug: "emploi",
            children: [
                "Offres d'emploi",
                "Demandes d'emploi"
            ]
        },
        {
            name: "Services à domicile",
            slug: "services-domicile",
            children: [
                "Femme de ménage",
                "Garde d'enfants / Nounou",
                "Aide aux personnes âgées",
                "Cuisinière à domicile",
                "Cours particuliers",

            ]
        },
        {
            name: "Annonces & Autres",
            slug: "annonces-autres",
            children: [
                "Partenariats",
                "Offres spéciales",
                "Recherches de services",
                "Autres"
            ]
        }
    ];

    console.log("🗑️ Suppression des anciennes catégories...");
    await prisma.category.deleteMany({});
    console.log("✅ Table vidée");

    console.log("🌱 Insertion des catégories...");

    // Fonction pour normaliser les slugs (supprimer accents et caractères spéciaux)
    const normalizeSlug = (text: string): string => {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ýÿ]/g, 'y')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/&/g, 'et')
            .replace(/\//g, '-')
            .replace(/'/g, '-')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    };

    for (const cat of categories) {
        const parent = await prisma.category.create({
            data: {
                name: cat.name,
                slug: cat.slug,
            },
        });

        for (const child of cat.children) {
            const childSlug = `${cat.slug}-${normalizeSlug(child)}`;

            await prisma.category.create({
                data: {
                    name: child,
                    slug: childSlug,
                    parentId: parent.id,
                },
            });
        }
    }

    console.log("✅ Catégories créées avec succès !");
}

main().finally(() => prisma.$disconnect());
