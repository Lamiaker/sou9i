import { SectionTendances } from "./SectionTendances";
import { CategoryService } from "@/services/categoryService";

interface SectionTendancesProps {
    title: string;
}

export async function SectionTendancesAsync({ title }: SectionTendancesProps) {
    // Récupérer les catégories tendances depuis la base de données
    const trendingCategories = await CategoryService.getTrendingCategories();

    // Si aucune tendance configurée, ne rien afficher
    if (trendingCategories.length === 0) {
        return null;
    }

    // Mapper vers le format attendu par SectionTendances
    const items = trendingCategories.map(cat => ({
        title: cat.name,
        img: cat.image,
        slug: cat.slug,
    }));

    return <SectionTendances title={title} items={items} />;
}
