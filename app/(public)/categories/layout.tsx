import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Toutes les Catégories | SweetLook',
    description: 'Explorez toutes nos catégories de produits et services',
};

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
