import Image from "next/image";
import SearchBarre from "./searchBarre";
import logo from "@/public/logo.png";
import ListeCategorices from "./ListeCategorices";

// NOUVEAU : Import des icônes dont nous avons besoin
import { Plus, Bell, Heart, Mail, User } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full shadow-sm border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6 ">
        {/* --- Section gauche : logo + bouton --- */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Image
            src={logo}
            alt="logo"
            width={100}
            height={100}
            className="cursor-pointer object-contain"
          />

          {/* Bouton orange */}
          <button className="bg-secondary hover:bg-primary text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
            <Plus size={20} />
            Déposer une annonce
          </button>
        </div>

        {/* --- Section milieu : barre de recherche --- */}
        <div className="flex-1 max-w-xl mx-6">
          <SearchBarre />
        </div>

        {/* --- Section droite : menu utilisateur --- */}
        <div className="flex items-center space-x-6 text-gray-700">
            {/* Bouton Mes recherches */}
            <button className="flex flex-col items-center group">
              <Bell size={22} />
              <span className="relative text-xs font-medium mt-1">
                Mes recherches
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            {/* Bouton Favoris */}
            <button className="flex flex-col items-center group">
              <Heart size={22} />
              <span className="relative text-xs font-medium mt-1">
                Favoris
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            {/* Bouton Messages */}
            <button className="flex flex-col items-center group">
              <Mail size={22} />
              <span className="relative text-xs font-medium mt-1">
                Messages
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>

            {/* Bouton Se connecter */}
            <button className="flex flex-col items-center group">
              <User size={22} />
              <span className="relative text-xs font-medium mt-1">
                Se connecter
                <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
              </span>
            </button>
          </div>

      </div>

      {/* --- Optionnel : ligne des catégories --- */}
      <ListeCategorices />
    </header>
  );
}