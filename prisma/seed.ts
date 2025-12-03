import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Début du seeding...')

    // Créer des catégories
    console.log('📦 Création des catégories...')
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'gateaux-patisserie' },
            update: {},
            create: {
                name: 'Gâteaux & Pâtisserie',
                slug: 'gateaux-patisserie',
                icon: '🍰',
                order: 1,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'decoration-evenements' },
            update: {},
            create: {
                name: 'Décoration & Événements',
                slug: 'decoration-evenements',
                icon: '🎉',
                order: 2,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'mode-beaute' },
            update: {},
            create: {
                name: 'Mode & Beauté',
                slug: 'mode-beaute',
                icon: '👗',
                order: 3,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'bebe-enfants' },
            update: {},
            create: {
                name: 'Bébé & Enfants',
                slug: 'bebe-enfants',
                icon: '👶',
                order: 4,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'artisanat' },
            update: {},
            create: {
                name: 'Artisanat',
                slug: 'artisanat',
                icon: '🎨',
                order: 5,
            },
        }),
    ])

    console.log(`✅ ${categories.length} catégories créées`)

    // Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...')
    const hashedPassword = await bcrypt.hash('password123', 10)

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'sarah@example.com' },
            update: {},
            create: {
                email: 'sarah@example.com',
                name: 'Sarah Amrani',
                password: hashedPassword,
                phone: '0555123456',
                city: 'Alger',
                avatar: 'https://i.pravatar.cc/150?img=1',
                isVerified: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'fatima@example.com' },
            update: {},
            create: {
                email: 'fatima@example.com',
                name: 'Fatima Benali',
                password: hashedPassword,
                phone: '0666234567',
                city: 'Oran',
                avatar: 'https://i.pravatar.cc/150?img=5',
                isVerified: true,
            },
        }),
        prisma.user.upsert({
            where: { email: 'amina@example.com' },
            update: {},
            create: {
                email: 'amina@example.com',
                name: 'Amina Kaci',
                password: hashedPassword,
                phone: '0777345678',
                city: 'Constantine',
                avatar: 'https://i.pravatar.cc/150?img=9',
                isVerified: false,
            },
        }),
    ])

    console.log(`✅ ${users.length} utilisateurs créés`)

    // Créer des annonces de test
    console.log('📢 Création des annonces...')

    const adsData = [
        {
            title: 'Gâteau d\'anniversaire personnalisé 3 étages',
            description: 'Magnifique gâteau de 3 étages pour vos événements spéciaux. Décoration personnalisée selon vos souhaits. Plusieurs parfums disponibles : chocolat, vanille, fraise. Livraison possible dans Alger et environs.',
            price: 8500,
            location: 'Alger',
            condition: 'Neuf',
            images: [
                'https://images.unsplash.com/photo-1558636508-e0db3814bd1d',
                'https://images.unsplash.com/photo-1562440499-64c9a12de960',
            ],
            deliveryAvailable: true,
            userId: users[0].id,
            categoryId: categories[0].id,
        },
        {
            title: 'Décoration ballon arche pour mariage',
            description: 'Service de décoration professionnelle avec arche de ballons. Idéal pour mariages, anniversaires et événements. Installation incluse. Photos portfolio disponibles sur demande.',
            price: 12000,
            location: 'Oran',
            condition: 'Neuf',
            images: [
                'https://images.unsplash.com/photo-1530103862676-de8ec\u003e898cbd',
            ],
            deliveryAvailable: false,
            userId: users[1].id,
            categoryId: categories[1].id,
        },
        {
            title: 'Robe de soirée élégante taille M',
            description: 'Superbe robe de soirée portée une seule fois. Couleur bordeaux, taille M. Parfait état, nettoyée à sec. Idéale pour mariage ou soirée chic.',
            price: 4500,
            location: 'Constantine',
            condition: 'Très bon état',
            brand: 'Zara',
            size: 'M',
            images: [
                'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
            ],
            deliveryAvailable: true,
            negotiable: true,
            userId: users[2].id,
            categoryId: categories[2].id,
        },
        {
            title: 'Poussette bébé 3en1 comme neuve',
            description: 'Poussette complète 3en1 : landau, poussette, siège auto. Utilisée 6 mois seulement. Très bon état, toutes les pièces incluses. Roues tout-terrain.',
            price: 15000,
            location: 'Alger',
            condition: 'Très bon état',
            brand: 'Chicco',
            images: [
                'https://images.unsplash.com/photo-1544743287-d72907de2e8d',
            ],
            deliveryAvailable: false,
            userId: users[0].id,
            categoryId: categories[3].id,
        },
    ]

    for (const adData of adsData) {
        await prisma.ad.create({
            data: adData,
        })
    }

    console.log(`✅ ${adsData.length} annonces créées`)

    console.log('✨ Seeding terminé avec succès!')
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
