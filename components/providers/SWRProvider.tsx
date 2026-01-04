"use client";

import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                refreshInterval: 0, // Désactivé par défaut
                revalidateOnFocus: true,
                revalidateOnReconnect: false, // Évite les pics de requêtes lors de micro-coupures wifi
                dedupingInterval: 5000, // Ne refait pas la même requête avant 5 secondes
                focusThrottleInterval: 30000, // Revalide au focus maximum toutes les 30 secondes
            }}
        >
            {children}
        </SWRConfig>
    );
}
