import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Vous devez être connecté' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('avatar') as File;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucune image fournie' },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Le fichier doit être une image' },
                { status: 400 }
            );
        }

        // Limiter la taille à 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'L\'image ne doit pas dépasser 5MB' },
                { status: 400 }
            );
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

        // Créer le dossier s'il n'existe pas
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // Le dossier existe déjà
        }

        // Récupérer l'utilisateur actuel pour supprimer son ancien avatar
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { avatar: true }
        });

        // Supprimer l'ancien avatar s'il existe et est dans /uploads/avatars/
        if (currentUser?.avatar && currentUser.avatar.startsWith('/uploads/avatars/')) {
            try {
                const oldFilePath = path.join(process.cwd(), 'public', currentUser.avatar.substring(1));
                if (existsSync(oldFilePath)) {
                    await unlink(oldFilePath);
                    console.log(`Ancien avatar supprimé: ${oldFilePath}`);
                }
            } catch (err) {
                console.error('Erreur suppression ancien avatar:', err);
            }
        }

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${session.user.id}-${timestamp}-${randomString}.${extension}`;

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sauvegarder le fichier
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // URL publique
        const avatarUrl = `/uploads/avatars/${filename}`;

        // Mettre à jour l'avatar dans la base de données
        await prisma.user.update({
            where: { id: session.user.id },
            data: { avatar: avatarUrl }
        });

        return NextResponse.json({
            success: true,
            data: {
                url: avatarUrl
            }
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'avatar'
            },
            { status: 500 }
        );
    }
}
