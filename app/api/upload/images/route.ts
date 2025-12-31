import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logServerError, AuthenticationError, ERROR_MESSAGES } from '@/lib/errors';

// ✅ SÉCURITÉ: Configuration stricte des fichiers autorisés
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

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
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucune image fournie' },
                { status: 400 }
            );
        }

        // ✅ SÉCURITÉ: Limiter le nombre de fichiers
        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { success: false, error: `Maximum ${MAX_FILES} images autorisées` },
                { status: 400 }
            );
        }

        const uploadedUrls: string[] = [];
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');

        // Créer le dossier s'il n'existe pas
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch {
            // Le dossier existe déjà
        }

        for (const file of files) {
            if (file.size === 0) continue;

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
                    { success: false, error: `Type de fichier non autorisé: ${file.type}. Types acceptés: JPEG, PNG, GIF, WebP` },
                    { status: 400 }
                );
            }

            // ✅ SÉCURITÉ: Vérifier l'extension originale (double validation)
            const originalExtension = file.name.split('.').pop()?.toLowerCase();
            if (!originalExtension || !ALLOWED_EXTENSIONS.includes(originalExtension)) {
                return NextResponse.json(
                    { success: false, error: `Extension de fichier non autorisée: .${originalExtension}` },
                    { status: 400 }
                );
            }

            // ✅ SÉCURITÉ: Utiliser l'extension basée sur le MIME type (pas l'extension originale)
            const safeExtension = MIME_TO_EXTENSION[file.type] || 'jpg';

            // ✅ SÉCURITÉ: Générer un nom de fichier aléatoire sécurisé (pas basé sur l'input utilisateur)
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const filename = `${timestamp}-${randomString}.${safeExtension}`;

            // ✅ SÉCURITÉ: S'assurer que le chemin ne contient pas de traversée de répertoire
            const safeFilename = path.basename(filename);
            const filepath = path.join(uploadDir, safeFilename);

            // Convertir le fichier en buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sauvegarder le fichier
            await writeFile(filepath, buffer);

            // Ajouter l'URL publique
            uploadedUrls.push(`/uploads/ads/${safeFilename}`);
        }

        return NextResponse.json({
            success: true,
            data: uploadedUrls,
        });
    } catch (error) {
        logServerError(error, { route: '/api/upload/images', action: 'upload_images' });

        if (error instanceof AuthenticationError) {
            return NextResponse.json(
                { success: false, error: 'Vous devez être connecté pour uploader des images' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, error: ERROR_MESSAGES.GENERIC },
            { status: 500 }
        );
    }
}
