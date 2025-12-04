import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Toutes les Catégories | FemMarket',
    description: 'Explorez toutes nos catégories de produits et services pour femmes',
};

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
