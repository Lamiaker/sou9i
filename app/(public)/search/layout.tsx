import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recherche | SweetLook',
    description: 'Trouvez ce que vous cherchez parmi des milliers d\'annonces sur SweetLook.',
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
