import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Déposer une annonce | SweetLook',
    description: 'Vendez vos articles ou proposez vos services sur SweetLook. Dépôt d\'annonce simple et gratuit.',
};

export default function DeposerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
