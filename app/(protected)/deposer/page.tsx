import DeposerAdForm from "@/components/forms/DeposerAdForm";
import { Metadata } from "next";
import { getCachedCategoriesHierarchy } from "@/lib/cache";

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
    // Récupérer les catégories avec cache Redis
    const categories = await getCachedCategoriesHierarchy();

    return <DeposerAdForm initialCategories={categories} />;
}
