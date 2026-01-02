"use client";

import { useState, useRef, useEffect } from 'react';
import { Share2, X, Check, Link2, MessageCircle, Instagram } from 'lucide-react';

interface ShareButtonProps {
    url: string;
    title: string;
    description?: string;
    className?: string;
    size?: number;
}

/**
 * Composant de partage avec support Web Share API et menu custom
 */
export default function ShareButton({ url, title, description, className = '', size = 20 }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Vérifier si Web Share API est disponible
    const canUseNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

    // Partage natif (mobile)
    const handleNativeShare = async () => {
        try {
            await navigator.share({
                title: title,
                text: description || title,
                url: url,
            });
        } catch (error) {
            // L'utilisateur a annulé ou erreur
            console.log('Share cancelled or failed');
        }
    };

    // Copier le lien
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // Fallback pour les anciens navigateurs
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // URLs de partage
    const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    };

    // Style commun pour les boutons de partage
    const shareButtonClass = "flex flex-col items-center justify-center gap-2 p-4 rounded-xl hover:bg-gray-100 transition-colors";

    // Clic sur le bouton principal
    const handleClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Bouton de partage */}
            <button
                onClick={handleClick}
                className={`p-2 hover:bg-gray-100 rounded-full transition ${className}`}
                aria-label="Partager"
                title="Partager cette annonce"
            >
                <Share2 size={size} className="text-gray-600" />
            </button>

            {/* Menu de partage (Desktop / Fallback) */}
            {isOpen && (
                <>
                    {/* Overlay pour mobile */}
                    <div
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-0 md:top-full md:mt-2 bg-white rounded-t-2xl md:rounded-2xl shadow-xl border border-gray-200 z-50 animate-slideUp md:animate-fadeIn md:w-80 overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Partager cette annonce</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Options de partage */}
                        <div className="p-4">
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {/* WhatsApp */}
                                <a
                                    href={shareUrls.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={shareButtonClass}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600">WhatsApp</span>
                                </a>

                                {/* Facebook */}
                                <a
                                    href={shareUrls.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={shareButtonClass}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-600">Facebook</span>
                                </a>

                                {/* Instagram */}
                                <button
                                    onClick={() => {
                                        handleCopyLink();
                                        setIsOpen(false);
                                    }}
                                    className={shareButtonClass}
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
                                        <Instagram className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-600">Instagram</span>
                                </button>

                                {/* Telegram */}
                                <a
                                    href={shareUrls.telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={shareButtonClass}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="w-12 h-12 rounded-full bg-[#0088CC] flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-gray-600">Telegram</span>
                                </a>

                                {/* Plus (Native Share) - Uniquement sur Mobile */}
                                {canUseNativeShare && (
                                    <button
                                        onClick={() => {
                                            handleNativeShare();
                                            setIsOpen(false);
                                        }}
                                        className={`${shareButtonClass} md:hidden`}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <Share2 className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <span className="text-xs text-gray-600">Plus</span>
                                    </button>
                                )}
                            </div>

                            {/* Copier le lien */}
                            <button
                                onClick={handleCopyLink}
                                className="w-full flex items-center justify-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check size={20} className="text-green-500" />
                                        <span className="font-medium text-green-600">Lien copié !</span>
                                    </>
                                ) : (
                                    <>
                                        <Link2 size={20} className="text-gray-600" />
                                        <span className="font-medium text-gray-700">Copier le lien</span>
                                    </>
                                )}
                            </button>

                            {/* Lien affiché */}
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                                <p className="text-xs text-gray-500 truncate">{url}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
