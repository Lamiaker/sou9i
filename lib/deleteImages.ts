import { unlink } from 'fs/promises';
import path from 'path';

/**
 * Supprime les fichiers image qui ne sont plus utilisés
 * @param oldImages - URLs des anciennes images
 * @param newImages - URLs des nouvelles images
 */
export async function deleteUnusedImages(oldImages: string[], newImages: string[]): Promise<void> {
    // Trouver les images à supprimer (présentes dans old mais pas dans new)
    const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

    if (imagesToDelete.length === 0) {
        console.log('Aucune image à supprimer');
        return;
    }

    console.log(`Suppression de ${imagesToDelete.length} image(s) orpheline(s)`);

    for (const imageUrl of imagesToDelete) {
        try {
            // Convertir URL en chemin fichier
            // Ex: "/uploads/ads/123-abc.jpg" → "c:/Users/.../public/uploads/ads/123-abc.jpg"
            const relativePath = imageUrl.replace(/^\//, ''); // Retirer le / du début
            const filePath = path.join(process.cwd(), 'public', relativePath);

            // Supprimer le fichier
            await unlink(filePath);
            console.log(`✅ Image supprimée: ${imageUrl}`);
        } catch (error) {
            // Fichier déjà supprimé ou inexistant
            console.error(`❌ Erreur suppression ${imageUrl}:`, error);
        }
    }
}
