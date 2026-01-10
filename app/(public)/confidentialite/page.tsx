import { Metadata } from 'next';
import ConfidentialiteClient from '@/components/legal/ConfidentialiteClient';



export const metadata: Metadata = {
    title: 'Politique de Confidentialité | SweetLook',
    description: 'Découvrez comment SweetLook collecte, utilise et protège vos données personnelles. Conformité loi 18-07 Algérie.',
    openGraph: {
        title: 'Politique de Confidentialité | SweetLook',
        description: 'Comment nous protégeons vos données personnelles sur SweetLook.',
        type: 'website',
        siteName: 'SweetLook',
        locale: 'fr_FR',
    },
    twitter: {
        card: 'summary',
        title: 'Confidentialité | SweetLook',
        description: 'Notre politique de protection des données.',
    },
};

export default function ConfidentialitePage() {
    return <ConfidentialiteClient />;
}
