import type { Metadata } from 'next';
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

export const metadata: Metadata = {
    title: 'Tableau de bord | SweetLook',
    description: 'Gérez vos annonces, messages et profil sur SweetLook.',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}

