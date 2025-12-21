import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import NextTopLoader from 'nextjs-toploader';
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import BanGuard from "@/components/auth/BanGuard";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FemMarket - Achat et Vente entre femmes en Algérie",
  description: "La première plateforme de vente et d'achat dédiée aux femmes en Algérie.",
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

