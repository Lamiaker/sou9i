import { useState } from 'react';

interface UseImageUploadReturn {
    uploading: boolean;
    error: string | null;
    uploadImages: (files: File[]) => Promise<string[]>;
}

export function useImageUpload(): UseImageUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImages = async (files: File[]): Promise<string[]> => {
        if (!files || files.length === 0) {
            throw new Error('Aucun fichier à uploader');
        }

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch('/api/upload/images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                return data.data; // URLs des images
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
        uploadImages,
    };
}
