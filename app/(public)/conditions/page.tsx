import { Metadata } from 'next';
import ConditionsClient from '@/components/legal/ConditionsClient';


export const metadata: Metadata = {
    title: 'Conditions Générales d\'Utilisation | SweetLook',
    description: 'Consultez les conditions générales d\'utilisation de SweetLook : inscription, publication d\'annonces, transactions et responsabilités.',
    openGraph: {
        title: 'CGU | SweetLook',
        description: 'Conditions générales d\'utilisation de la plateforme SweetLook.',
        type: 'website',
        siteName: 'SweetLook',
        locale: 'fr_FR',
    },
    twitter: {
        card: 'summary',
        title: 'Conditions d\'utilisation | SweetLook',
        description: 'Consultez nos conditions générales d\'utilisation.',
    },
};

export default function ConditionsPage() {
    return <ConditionsClient />;
}
