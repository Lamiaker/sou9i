import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recherche | FemMarket',
    description: 'Trouvez ce que vous cherchez parmi des milliers d\'annonces sur FemMarket.',
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
