import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Connexion / Inscription | FemMarket',
    description: 'Connectez-vous ou créez un compte sur FemMarket pour commencer à vendre et acheter.',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    );
}