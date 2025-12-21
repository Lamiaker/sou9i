"use client";

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import ReportModal from './ReportModal';

interface ReportButtonProps {
    adId?: string;
    adTitle?: string;
    userId?: string;
    userName?: string;
    variant?: 'icon' | 'button' | 'text';
    className?: string;
}

export default function ReportButton({
    adId,
    adTitle,
    userId,
    userName,
    variant = 'button',
    className = ''
}: ReportButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const toast = useToast();
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        if (!session) {
            // Afficher un toast pour informer l'utilisateur
            toast.info('Veuillez vous connecter pour signaler');

            // Rediriger vers la connexion après 1.5s
            setTimeout(() => {
                router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
            }, 3000);
            return;
        }
        setShowModal(true);
    };

    const renderButton = () => {
        switch (variant) {
            case 'icon':
                return (
                    <button
                        onClick={handleClick}
                        className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ${className}`}
                        title="Signaler"
                    >
                        <Flag className="w-5 h-5" />
                    </button>
                );

            case 'text':
                return (
                    <button
                        onClick={handleClick}
                        className={`text-gray-500 hover:text-red-500 text-sm flex items-center gap-1.5 transition-colors ${className}`}
                    >
                        <Flag className="w-4 h-4" />
                        Signaler
                    </button>
                );

            case 'button':
            default:
                return (
                    <button
                        onClick={handleClick}
                        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl font-medium transition-colors ${className}`}
                    >
                        <Flag className="w-4 h-4" />
                        Signaler
                    </button>
                );
        }
    };

    return (
        <>
            {renderButton()}

            <ReportModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                adId={adId}
                adTitle={adTitle}
                userId={userId}
                userName={userName}
            />
        </>
    );
}
