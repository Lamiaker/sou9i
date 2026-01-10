import { CategoryService } from "@/services";
import DeposerAdForm from "@/components/forms/DeposerAdForm";
import { Metadata } from "next";

/**
 * Page de dépôt d'annonce - Zone Protégée
 * 
 * Cette page bénéficie maintenant du ProtectedLayout (dynamique).
 * L'utilisateur est garanti d'être authentifié via le middleware et le layout.
 */
export const metadata: Metadata = {
    title: 'Déposer une annonce | SweetLook',
    description: 'Vendez vos articles ou proposez vos services sur SweetLook. Dépôt d\'annonce simple et gratuit.',
};

export default async function DeposerPage() {
    // Récupérer les catégories (sera servi par le cache unstable_cache du service)
    const categories = await CategoryService.getCategoriesHierarchy();

    return <DeposerAdForm initialCategories={categories} />;
}
