import { useState } from 'react';

interface UseAvatarUploadReturn {
    uploading: boolean;
    error: string | null;
    uploadAvatar: (file: File) => Promise<string>;
}

export function useAvatarUpload(): UseAvatarUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadAvatar = async (file: File): Promise<string> => {
        if (!file) {
            throw new Error('Aucun fichier à uploader');
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            throw new Error('Le fichier doit être une image');
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            throw new Error('L\'image ne doit pas dépasser 5MB');
        }

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                return data.data.url; // URL de l'avatar
            } else {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        error,
        uploadAvatar,
    };
}
