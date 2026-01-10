import { Metadata } from 'next';
import ServicesClient from '@/components/services/ServicesClient';



export const metadata: Metadata = {
    title: 'Nos Services | SweetLook',
    description: 'Découvrez nos services de développement web et mobile : site vitrine, e-commerce, applications, design UX et conseil stratégique.',
    openGraph: {
        title: 'Services de Développement Web | SweetLook',
        description: 'Solutions digitales sur mesure : sites web, applications, e-commerce.',
        type: 'website',
        siteName: 'SweetLook',
        locale: 'fr_FR',
    },
    twitter: {
        card: 'summary',
        title: 'Nos Services | SweetLook',
        description: 'Développement web et mobile sur mesure.',
    },
};

export default function ServicesPage() {
    return <ServicesClient />;
}
