import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import NextTopLoader from 'nextjs-toploader';
import { ToastProvider } from "@/components/ui/Toast";
import NetworkStatus from "@/components/ui/NetworkStatus";
import GoogleAnalytics from "@/components/GoogleAnalytics";

/**
 * RootLayout NEUTRE - Architecture ISR
 * 
 * ✅ Ce layout ne contient PAS :
 * - force-dynamic (permet ISR aux enfants)
 * - SessionProvider (déplacé dans les layouts enfants)
 * - BanGuard (centralisé dans le middleware)
 * - ConditionalLayout (remplacé par route groups)
 * 
 * La stratégie de rendu est déterminée par les layouts enfants :
 * - (public)/layout.tsx  → ISR/SSG (pas de force-dynamic)
 * - (protected)/layout.tsx → Dynamic (avec force-dynamic)
 * - (auth)/layout.tsx → Dynamic (avec force-dynamic)
 * - sl-panel-9x7k/layout.tsx → Dynamic (avec force-dynamic)
 * 
 * Sécurité : Le middleware gère l'authentification et le bannissement
 * AVANT d'atteindre les pages. Aucune fuite de données auth dans le cache.
 */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "SweetLook - Marketplace de Services et Articles en Algérie",
  description: "Votre plateforme en ligne pour acheter, vendre et proposer des services en Algérie. Mode, beauté, maison, artisanat et bien plus.",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID || ''} />
        <NextTopLoader color="#ec4899" showSpinner={false} />
        <NetworkStatus />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
