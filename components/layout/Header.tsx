"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Bell, Heart, Mail, User, Search, Menu, X, MessageCircle, Gift } from "lucide-react";
import logo from "@/public/logo.png";
import SearchBarre from "./searchBarre";
import ListeCategorices from "./ListeCategorices";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
            alt="leboncoin"
            width={130}
            height={36}
            className="cursor-pointer object-contain"
          />

          {/* Espace vide pour équilibrer */}
          <div className="w-6"></div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-gray-50 text-left hover:bg-gray-100 transition"
          >
            <Search size={18} className="text-gray-500" />
            <span className="text-gray-500 text-sm">Rechercher sur leboncoin</span>
          </button>
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
              alt="logo"
              width={100}
              height={100}
              className="cursor-pointer object-contain"
            />

            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
              <Plus size={20} />
              Déposer une annonce
            </button>
          </div>

          {/* Section milieu : barre de recherche */}
          <div className="flex-1 max-w-xl mx-6">
            <SearchBarre />
          </div>

          {/* Section droite : menu utilisateur */}
          <div className="flex items-center space-x-6 text-gray-700">
            <button className="flex flex-col items-center group">
              <Bell size={22} />
              <span className="relative text-xs font-medium mt-1">
                Mes recherches
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            <button className="flex flex-col items-center group">
              <Heart size={22} />
              <span className="relative text-xs font-medium mt-1">
                Favoris
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            <button className="flex flex-col items-center group">
              <Mail size={22} />
              <span className="relative text-xs font-medium mt-1">
                Messages
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            <button className="flex flex-col items-center group">
              <User size={22} />
              <span className="relative text-xs font-medium mt-1">
                Se connecter
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-orange-500 scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>
          </div>
        </div>

        {/* Catégories Desktop */}
        <ListeCategorices />
      </div>

      {/* Menu latéral mobile - Style Leboncoin exact */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl lg:hidden overflow-y-auto animate-slideInLeft">
            {/* Header du menu avec logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
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
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-100">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Plus size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Déposer une annonce</span>
              </button>

              {/* Rechercher */}
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-100">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Search size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Rechercher</span>
              </button>

              {/* Messages */}
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-100">
                <div className="w-5 h-5 flex items-center justify-center">
                  <MessageCircle size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Messages</span>
              </button>

              {/* Favoris */}
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-100">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Heart size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Favoris</span>
              </button>

              {/* Recherches sauvegardées */}
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-100">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Bell size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Recherches sauvegardées</span>
              </button>

              {/* Bons plans */}
              <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-200">
                <div className="w-5 h-5 flex items-center justify-center">
                  <Gift size={20} className="text-gray-700" strokeWidth={2} />
                </div>
                <span className="text-gray-800 font-bold">Bons plans !</span>
              </button>

              {/* Section Catégories - Utilise le composant ListeCategorices */}
              <div className="pt-4 pb-2">
                <h3 className="px-6 py-2 text-xs font-medium  text-gray-500 uppercase tracking-wider">
                  Catégories
                </h3>
                <div className="px-6 py-2">
                  <ListeCategorices isMobileMenu={true} />
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
              <SearchBarre />
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-500 text-sm">Commencez à taper pour rechercher...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.25s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}