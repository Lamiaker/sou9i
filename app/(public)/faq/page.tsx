import { Metadata } from 'next';
import FAQClient from '@/components/faq/FAQClient';



export const metadata: Metadata = {
    title: 'Foire Aux Questions | SweetLook',
    description: 'Trouvez les réponses à vos questions sur SweetLook : inscription, publication d\'annonces, achats, sécurité et plus encore.',
    openGraph: {
        title: 'FAQ | SweetLook',
        description: 'Toutes les réponses à vos questions sur la plateforme SweetLook.',
        type: 'website',
        siteName: 'SweetLook',
        locale: 'fr_FR',
    },
    twitter: {
        card: 'summary',
        title: 'FAQ | SweetLook',
        description: 'Trouvez les réponses à vos questions.',
    },
};

export default function FAQPage() {
    return <FAQClient />;
}
