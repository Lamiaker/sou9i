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
            // 1. SÉCURITÉ: Valider le format de l'URL pour éviter toute injection
            if (!/^\/uploads\/[a-z0-9\/\-.]+\.(jpg|jpeg|png|webp|gif)$/i.test(imageUrl)) {
                console.error(`❌ Tentative de suppression invalide (format URL): ${imageUrl}`);
                continue;
            }

            // 2. SÉCURITÉ: Convertir URL en chemin fichier absolu et normalisé
            const relativePath = imageUrl.replace(/^\//, ''); // Retirer le / du début
            const publicDir = path.join(process.cwd(), 'public');
            const filePath = path.resolve(publicDir, relativePath);

            // 3. SÉCURITÉ: Vérifier que le chemin final est bien à L'INTÉRIEUR du dossier public
            if (!filePath.startsWith(publicDir)) {
                console.error(`❌ Tentative de Path Traversal détectée: ${imageUrl}`);
                continue;
            }

            // Supprimer le fichier
            await unlink(filePath);
            console.log(`✅ Image supprimée: ${imageUrl}`);
        } catch (error) {
            // Fichier déjà supprimé ou inexistant
            console.error(`❌ Erreur suppression ${imageUrl}:`, error);
        }
    }
}
