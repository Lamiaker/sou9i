import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Déposer une annonce | FemMarket',
    description: 'Vendez vos articles rapidement sur FemMarket. Dépôt d\'annonce simple et gratuit.',
};

export default function DeposerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
