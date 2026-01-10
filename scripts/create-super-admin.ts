

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('\n🔒 Création du Super-Admin SweetLook\n');
    console.log('━'.repeat(50));

    // Vérifier qu'aucun admin n'existe
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
        console.log('\n❌ Un administrateur existe déjà.');
        console.log('   Utilisez le panneau d\'administration pour créer de nouveaux admins.\n');
        process.exit(1);
    }

    // Collecter les informations
    const name = await question('Nom complet: ');
    const email = await question('Email: ');
    const password = await question('Mot de passe (min 12 caractères): ');
    const confirmPassword = await question('Confirmer le mot de passe: ');

    // Validations
    if (!name || name.length < 2) {
        console.log('\n❌ Le nom doit contenir au moins 2 caractères.\n');
        process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.log('\n❌ Email invalide.\n');
        process.exit(1);
    }

    if (password.length < 12) {
        console.log('\n❌ Le mot de passe doit contenir au moins 12 caractères.\n');
        process.exit(1);
    }

    if (password !== confirmPassword) {
        console.log('\n❌ Les mots de passe ne correspondent pas.\n');
        process.exit(1);
    }

    // Créer le super-admin
    console.log('\n⏳ Création du super-admin...');

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
        data: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            name: name.trim(),
            isSuperAdmin: true,
            permissions: [
                'USERS_READ',
                'USERS_WRITE',
                'USERS_DELETE',
                'USERS_BAN',
                'ADS_READ',
                'ADS_MODERATE',
                'ADS_DELETE',
                'REPORTS_READ',
                'REPORTS_RESOLVE',
                'CATEGORIES_MANAGE',
                'SUPPORT_READ',
                'SUPPORT_WRITE',
                'SETTINGS_MANAGE',
                'ADMINS_MANAGE',
            ],
        },
    });

    console.log('\n✅ Super-admin créé avec succès!');
    console.log('━'.repeat(50));
    console.log(`   ID:    ${admin.id}`);
    console.log(`   Nom:   ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log('━'.repeat(50));
    console.log('\n🔐 Connectez-vous sur /admin/login\n');

    rl.close();
    process.exit(0);
}

main()
    .catch((error) => {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
        rl.close();
    });
