'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef, useCallback } from 'react';

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    className?: string;
}

export default function TurnstileWidget({
    onVerify,
    onError,
    onExpire,
    className = ''
}: TurnstileWidgetProps) {
    const ref = useRef<TurnstileInstance>(null);

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    // En développement sans clé, afficher un placeholder
    if (!siteKey) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 ${className}`}>
                    ⚠️ CAPTCHA désactivé en développement (NEXT_PUBLIC_TURNSTILE_SITE_KEY manquante)
                    <button
                        type="button"
                        onClick={() => onVerify('dev-token')}
                        className="ml-2 text-yellow-800 underline"
                    >
                        Simuler succès
                    </button>
                </div>
            );
        }
        return null;
    }

    const handleError = useCallback(() => {
        onError?.();
        // Reset le widget pour permettre une nouvelle tentative
        ref.current?.reset();
    }, [onError]);

    const handleExpire = useCallback(() => {
        onExpire?.();
        ref.current?.reset();
    }, [onExpire]);

    return (
        <div className={className}>
            <Turnstile
                ref={ref}
                siteKey={siteKey}
                onSuccess={onVerify}
                onError={handleError}
                onExpire={handleExpire}
                options={{
                    theme: 'light',
                    size: 'normal',
                }}
            />
        </div>
    );
}
