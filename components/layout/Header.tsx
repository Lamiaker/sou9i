import Image from "next/image";
import SearchBarre from "./searchBarre";
import logo from "@/public/logo.png";
import ListeCategorices from "./ListeCategorices";
// import ListeCategorices from "./ListeCategorices";

export default function Header() {
  return (
    <header className="w-full shadow-sm border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
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
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition">
            Déposer une annonce
          </button>
        </div>

        {/* --- Section milieu : barre de recherche --- */}
        <div className="flex-1 max-w-xl mx-6">
          <SearchBarre />
        </div>

        {/* --- Section droite : menu utilisateur --- */}
        <div className="flex items-center space-x-6 text-gray-700 font-medium">
          <button className="hover:text-orange-500 transition">Mes recherches</button>
          <button className="hover:text-orange-500 transition">Favoris</button>
          <button className="hover:text-orange-500 transition">Messages</button>
          <button className="hover:text-orange-500 transition">Se connecter</button>
        </div>
      </div>

      {/* --- Optionnel : ligne des catégories comme sur Leboncoin --- */}
      <div className="w-full bg-gray-50 border-t border-gray-200 py-2">
        <ListeCategorices />
      </div>
    </header>
  );
}
