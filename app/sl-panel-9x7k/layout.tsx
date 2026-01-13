import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import SWRProvider from '@/components/providers/SWRProvider';

// Zone privée : force-dynamic requis (sera conservé après refonte ISR)
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
    title: 'Administration | SweetLook',
    description: 'Panneau d\'administration SweetLook - Gérez les utilisateurs, annonces et signalements.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SWRProvider>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </SWRProvider>
    );
}


