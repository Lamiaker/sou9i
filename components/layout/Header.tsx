"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import { Plus, Bell, Heart, Mail, User, Search, Menu, X, MessageCircle, Gift } from "lucide-react";
import logo from "@/public/logo.png";
import SearchBar from "./SearchBar";
import ListeCategorices from "./ListeCategorices";
import MenuButton from "../ui/MenuButton";
import IconButtonWithLabel from "../ui/IconButtonWithLabel";
import { useFavorites } from "@/context/FavoritesContext";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const { favorites } = useFavorites();

  const router = useRouter();

  const handleMenuAction = (path: string) => {
    setMenuClosing(true);

    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setMenuClosing(false);
      router.push(path);
    }, 250);
  };

  return (
    <header className="w-full shadow-sm bg-white sticky top-0 z-30">
      {/* Header Mobile */}
      <div className="lg:hidden">
        {/* Première ligne : Menu + Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          {/* Bouton Menu */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Menu"
          >
            <Menu size={24} className="text-gray-800" strokeWidth={2} />
          </button>

          {/* Logo centré */}

          <Image
            src={logo}
            alt="FemMarket"
            width={130}
            height={36}
            style={{ transform: "scale(1.5)" }}
            className="cursor-pointer object-contain"
          />


          {/* Espace vide pour équilibrer */}
          <div className="w-6"></div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="px-4 py-3 border-b border-gray-100">
          <SearchBar />
        </div>

        {/* Catégories scrollables horizontalement - Mobile */}
        <div className="overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
          <ListeCategorices />
        </div>
      </div>

      {/* Header Desktop */}
      <div className="hidden lg:block border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
          {/* Section gauche : logo + bouton */}
          <div className="flex items-center gap-4">

            <Image
              src={logo}
              alt="FemMarket"
              width={130}
              height={36}
              style={{ transform: "scale(1)" }}
              className="cursor-pointer object-contain"
            />


            <Link href="/deposer">
              <button className="bg-secondary cursor-pointer hover:bg-primary text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Déposer une annonce
              </button>
            </Link>
          </div>

          {/* Section milieu : barre de recherche */}
          <div className="flex-1 max-w-xl mx-6 ">
            <SearchBar />
          </div>

          {/* Section droite : menu utilisateur */}
          <div className="flex items-center space-x-6 text-gray-700">
            <IconButtonWithLabel
              icon={Bell}
              label="Mes recherches"
            />

            <div className="relative">
              <IconButtonWithLabel
                icon={Heart}
                label="Favoris"
                href="/dashboard/favoris"
              />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>

            <IconButtonWithLabel
              icon={Mail}
              label="Messages"
            />

            <IconButtonWithLabel
              icon={User}
              label="Se connecter"
              href="/login"
            />
          </div>
        </div>

        {/* Catégories Desktop */}
        <ListeCategorices />
      </div>

      {/* Menu latéral mobile - Style Leboncoin exact */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] bg-opacity-40 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl lg:hidden overflow-y-auto 
            ${menuClosing ? "animate-slideOutLeft" : "animate-slideInLeft"}`}
          >
            {/* Header du menu avec logo */}
            <div className="flex items-center justify-between px-6  py-4 border-b border-gray-200">
              <div className="w-6"></div>

              <Image
                src={logo}
                alt="leboncoin"
                width={130}
                height={36}
                className="object-contain"
              />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                aria-label="Fermer"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            {/* Menu principal */}
            <div className="py-2">
              {/* Déposer une annonce */}
              <MenuButton
                icon={Plus}
                text="Déposer une annonce"
                onClick={() => handleMenuAction("/deposer")}
              />

              {/* Rechercher */}
              <MenuButton
                icon={Search}
                text="Rechercher"
                onClick={() => handleMenuAction("/search")}
                hasBorder={true}
              />

              {/* Messages */}
              <MenuButton
                icon={MessageCircle}
                text="Messages"
                onClick={() => handleMenuAction("/messages")}
              />

              {/* Favoris avec badge */}
              <div className="relative">
                <MenuButton
                  icon={Heart}
                  text="Favoris"
                  onClick={() => handleMenuAction("/dashboard/favoris")}
                />
                {favorites.length > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </div>

              {/* Recherches sauvegardées */}
              <MenuButton
                icon={Bell}
                text="Recherches sauvegardées"
                onClick={() => handleMenuAction("/recherches")}
                hasBorder={true}
              />

              {/* Bons plans */}
              <MenuButton
                icon={Gift}
                text="Bons plans !"
                onClick={() => handleMenuAction("/bonsplans")}
                hasBorder={true}
              />

              {/* Section Catégories - Utilise le composant ListeCategorices */}
              <div className="pt-4 pb-2 ">
                <h3 className="px-4 py-2 text-xs font-medium  text-gray-500 uppercase tracking-wider ">
                  Catégories
                </h3>
                <div className="px-4 py-2">
                  <ListeCategorices isMobileMenu={true} onSelectItem={(path: string) => handleMenuAction(path)} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de recherche mobile plein écran */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <X size={24} />
            </button>
            <div className="flex-1">
              <SearchBar />
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-sm">Commencez à taper pour rechercher...</p>
          </div>
        </div>
      )}
    </header>
  );
}