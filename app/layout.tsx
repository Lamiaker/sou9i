import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import NextTopLoader from 'nextjs-toploader';

import { FavoritesProvider } from "@/context/FavoritesContext";
import SessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Shop",
  description: "Next Shop",
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
          <FavoritesProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
