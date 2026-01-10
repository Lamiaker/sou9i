/**
 * Layout pour la page de login admin
 * 
 * Cette page est publique (pas de vérification d'auth)
 * pour permettre aux admins de se connecter.
 */

import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Connexion Admin | SweetLook',
    description: 'Connexion au panneau d\'administration SweetLook',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}


