import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('images') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Aucune image fournie' },
                { status: 400 }
            );
        }

        const uploadedUrls: string[] = [];
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');

        // Créer le dossier s'il n'existe pas
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (error) {
            // Le dossier existe déjà
        }

        for (const file of files) {
            if (file.size === 0) continue;

            // Générer un nom de fichier unique
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 15);
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}-${randomString}.${extension}`;

            // Convertir le fichier en buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sauvegarder le fichier
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);

            // Ajouter l'URL publique
            uploadedUrls.push(`/uploads/ads/${filename}`);
        }

        return NextResponse.json({
            success: true,
            data: uploadedUrls,
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur lors de l\'upload des images'
            },
            { status: 500 }
        );
    }
}
