import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

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
