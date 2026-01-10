import PublicLayoutClient from "@/components/layout/PublicLayoutClient";

/**
 * Layout pour les pages publiques (ISR/SSG)
 * 
 * Ce layout est un Server Component qui délègue à PublicLayoutClient.
 * Cela permet aux pages enfants d'être générées statiquement (ISR/SSG)
 * car ce layout ne contient pas de hooks dynamiques.
 * 
 * ✅ Ce layout ne contient PAS :
 * - force-dynamic (permet ISR aux pages enfants)
 * - Hooks React (useSession, useState, etc.)
 * - BanGuard (centralisé dans le middleware)
 * 
 * Le SessionProvider et les contextes sont gérés dans PublicLayoutClient,
 * qui est un composant client hydraté après le rendu initial.
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PublicLayoutClient>{children}</PublicLayoutClient>;
}
