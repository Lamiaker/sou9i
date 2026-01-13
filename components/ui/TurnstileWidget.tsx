'use client';

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    className?: string;
}

export interface TurnstileWidgetRef {
    reset: () => void;
}

const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(({
    onVerify,
    onError,
    onExpire,
    className = ''
}, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
        reset: () => {
            turnstileRef.current?.reset();
        }
    }));

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const handleError = useCallback(() => {
        onError?.();
        turnstileRef.current?.reset();
    }, [onError]);

    const handleExpire = useCallback(() => {
        onExpire?.();
        turnstileRef.current?.reset();
    }, [onExpire]);

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

    return (
        <div className={className}>
            <Turnstile
                ref={turnstileRef}
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
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
