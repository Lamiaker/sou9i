import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

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
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}


