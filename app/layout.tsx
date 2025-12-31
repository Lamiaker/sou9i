import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import NextTopLoader from 'nextjs-toploader';
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import BanGuard from "@/components/auth/BanGuard";
import { ToastProvider } from "@/components/ui/Toast";
import NetworkStatus from "@/components/ui/NetworkStatus";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SweetLook - Marketplace de Services et Articles en Algérie",
  description: "Votre plateforme en ligne pour acheter, vendre et proposer des services en Algérie. Mode, beauté, maison, artisanat et bien plus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <NextTopLoader color="#ec4899" showSpinner={false} />
        <NetworkStatus />
        <SessionProvider>
          <SWRProvider>
            <ToastProvider>
              <BanGuard>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </BanGuard>
            </ToastProvider>
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

