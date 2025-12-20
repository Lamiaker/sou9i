"use client";

import { SWRConfig } from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                refreshInterval: 0, // Désactivé par défaut, on l'active par hook
                revalidateOnFocus: true,
                revalidateOnReconnect: true,
            }}
        >
            {children}
        </SWRConfig>
    );
}
