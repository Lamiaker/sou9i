import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {

    const categories = [
        {
            name: "Gâteaux & Pâtisserie",
            slug: "gateaux-patisserie",
            children: [
                "Gâteaux traditionnels",
                "Gâteaux modernes",
                "Pâtisserie personnalisée",
                "Autre"
            ]
        },
        {
            name: "Décoration & Événements",
            slug: "decoration-evenements",
            children: [
                "Décoration maison",
                "Organisation d'événements",
                "Fêtes & accessoires",
                "Autre"
            ]
        },
        {
            name: "Mode & Beauté",
            slug: "mode-beaute",
            children: [
                "Vêtements femmes",
                "Cosmétiques",
                "Accessoires",
                "Autre"
            ]
        },
        {
            name: "Bébé & Enfants",
            slug: "bebe-enfants",
            children: [
                "Vêtements enfants",
                "Articles bébé",
                "Événements enfants",
                "Autre"
            ]
        },
        {
            name: "Services Femmes",
            slug: "services-femmes",
            children: [
                "Beauté & soins",
                "Couture & retouches",
                "Formations & ateliers",
                "Autre"
            ]
        },
        {
            name: "Maison & Artisanat",
            slug: "maison-artisanat",
            children: [
                "Produits maison",
                "Cuisine maison",
                "Autre"
            ]
        },
        {
            name: "Aides & Petites Annonces",
            slug: "aides-petites-annonces",
            children: [
                "Échanges & dons",
                "Petites annonces",
                "Autre"
            ]
        },
        {
            name: "Autres",
            slug: "autres",
            children: ["Divers"]
        },
        {
            name: "Bijoux & Accessoires Artisanaux",
            slug: "bijoux-accessoires-artisanaux",
            children: [
                "Bijoux en argent",
                "Bijoux perles",
                "Accessoires sacs",
                "Accessoires foulards",
                "Autre"
            ]
        },
        {
            name: "Bien-être & Soins Naturels",
            slug: "bien-etre-soins-naturels",
            children: [
                "Huiles essentielles",
                "Produits cosmétiques bio",
                "Infusions & tisanes",
                "Autre"
            ]
        },
        {
            name: "Événements & Célébrations",
            slug: "evenements-celebrations",
            children: [
                "Mariages",
                "Fiançailles",
                "Baptêmes",
                "Anniversaires",
                "Autre"
            ]
        },
        {
            name: "Formations & Coaching",
            slug: "formations-coaching",
            children: [
                "Entrepreneuriat",
                "Pâtisserie",
                "Couture",
                "Digital",
                "Autre"
            ]
        },
        {
            name: "Art & Décoration Murale",
            slug: "art-decoration-murale",
            children: [
                "Tableaux",
                "Calligraphie",
                "Décoration islamique",
                "Photos personnalisées",
                "Autre"
            ]
        },
        {
            name: "Cuisine Traditionnelle",
            slug: "cuisine-traditionnelle",
            children: [
                "Plats préparés",
                "Pâtisseries orientales",
                "Confitures maison",
                "Épices",
                "Autre"
            ]
        },
        {
            name: "Location & Services",
            slug: "location-services",
            children: [
                "Location de robes",
                "Location de matériel événementiel",
                "Services à domicile",
                "Autre"
            ]
        }
    ];

    // Vider la table des catégories
    console.log("🗑️  Suppression des anciennes catégories...");
    await prisma.category.deleteMany({});
    console.log("✅ Table vidée avec succès !");

    console.log("🌱 Insertion des nouvelles catégories...");

    for (const cat of categories) {
        // Créer la catégorie parente
        const parent = await prisma.category.create({
            data: {
                name: cat.name,
                slug: cat.slug,
            },
        });

        // Créer les sous-catégories
        for (const child of cat.children) {
            const childSlug = `${cat.slug}-${child.toLowerCase().replace(/ /g, "-").replace(/&/g, "et")}`;
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

main()
    .finally(() => prisma.$disconnect());
