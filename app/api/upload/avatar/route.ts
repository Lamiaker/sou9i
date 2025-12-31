import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logServerError, AuthenticationError, ERROR_MESSAGES } from '@/lib/errors';

// ✅ SÉCURITÉ: Configuration stricte des fichiers autorisés
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB pour les avatars

// Mapping MIME type vers extension sûre
const MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
    try {
        // ✅ SÉCURITÉ: Vérification de l'authentification
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            throw new AuthenticationError();
        }

        const formData = await request.formData();
        const file = formData.get('avatar') as File;

        if (!file || file.size === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucune image fournie' },
                { status: 400 }
            );
        }

        // ✅ SÉCURITÉ: Vérifier la taille du fichier
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
                { status: 400 }
            );
        }

        // ✅ SÉCURITÉ: Vérifier le type MIME
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: `Type de fichier non autorisé: ${file.type}` },
                { status: 400 }
            );
        }

        // ✅ SÉCURITÉ: Vérifier l'extension originale (double validation)
        const originalExtension = file.name.split('.').pop()?.toLowerCase();
        if (!originalExtension || !ALLOWED_EXTENSIONS.includes(originalExtension)) {
            return NextResponse.json(
                { success: false, error: `Extension de fichier non autorisée` },
                { status: 400 }
            );
        }

        // ✅ SÉCURITÉ: Utiliser l'extension basée sur le MIME type
        const safeExtension = MIME_TO_EXTENSION[file.type] || 'jpg';

        // ✅ SÉCURITÉ: Inclure l'ID utilisateur dans le nom pour éviter les conflits
        const timestamp = Date.now();
        const userId = session.user.id.replace(/[^a-zA-Z0-9]/g, ''); // Sanitize user ID
        const filename = `avatar-${userId}-${timestamp}.${safeExtension}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

        // Créer le dossier s'il n'existe pas
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // Le dossier existe déjà
        }

        // ✅ SÉCURITÉ: S'assurer que le chemin ne contient pas de traversée de répertoire
        const safeFilename = path.basename(filename);
        const filepath = path.join(uploadDir, safeFilename);

        // Convertir le fichier en buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sauvegarder le fichier
        await writeFile(filepath, buffer);

        return NextResponse.json({
            success: true,
            data: { url: `/uploads/avatars/${safeFilename}` },
        });
    } catch (error) {
        logServerError(error, { route: '/api/upload/avatar', action: 'upload_avatar' });

        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { success: false, error: 'Vous devez être connecté' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}
