import type { Metadata } from 'next';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
    title: 'Administration | FemMarket',
    description: 'Panneau d\'administration FemMarket - Gérez les utilisateurs, annonces et signalements.',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
