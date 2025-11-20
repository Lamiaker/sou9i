"use client";
import { useState, useMemo,  useRef } from 'react';
import { MapPin, Heart,  ChevronDown, X, SlidersHorizontal } from 'lucide-react';

import immobilierExamples from '@/app/Data/immobilierExamples';

type FilterState = {
  typeTransaction: string;
  typeBien: string;
  ville: string;
  prixMin: number;
  prixMax: number;
  surfaceMin: number;
  surfaceMax: number;
  piecesMin: number;
  piecesMax: number;
  chambresMin: number;
};

export default function ImmobilierListPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    typeTransaction: '',
    typeBien: '',
    ville: '',
    prixMin: 0,
    prixMax: 100000000,
    surfaceMin: 0,
    surfaceMax: 500,
    piecesMin: 0,
    piecesMax: 10,
    chambresMin: 0,
  });


  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const formatPrice = (prix: number, typeTransaction: string) => {
    if (typeTransaction === "Location") {
      return `${prix.toLocaleString('fr-FR')} DA/mois`;
    }
    return `${prix.toLocaleString('fr-FR')} DA`;
  };

  // Appliquer les filtres
  const filteredAnnonces = useMemo(() => {
    return immobilierExamples.filter(annonce => {
      if (filters.typeTransaction && annonce.typeTransaction !== filters.typeTransaction) {
        return false;
      }
      if (filters.typeBien && annonce.typeBien !== filters.typeBien) {
        return false;
      }
      if (filters.ville && annonce.localisation.ville !== filters.ville) {
        return false;
      }
      if (annonce.prix < filters.prixMin || annonce.prix > filters.prixMax) {
        return false;
      }
      if (annonce.surface < filters.surfaceMin || annonce.surface > filters.surfaceMax) {
        return false;
      }
      if (annonce.pieces < filters.piecesMin || annonce.pieces > filters.piecesMax) {
        return false;
      }
      if (filters.chambresMin > 0 && annonce.logementDetails?.chambres) {
        if (annonce.logementDetails.chambres < filters.chambresMin) {
          return false;
        }
      }
      return true;
    });
  }, [filters]);

const updateFilter = (key: keyof FilterState, value: any) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};


  const resetFilters = () => {
    setFilters({
      typeTransaction: '',
      typeBien: '',
      ville: '',
      prixMin: 0,
      prixMax: 100000000,
      surfaceMin: 0,
      surfaceMax: 500,
      piecesMin: 0,
      piecesMax: 10,
      chambresMin: 0,
    });
  };

  const villes = Array.from(new Set(immobilierExamples.map(a => a.localisation.ville)));
  const typesBien = Array.from(new Set(immobilierExamples.map(a => a.typeBien)));
  const typesTransaction = Array.from(new Set(immobilierExamples.map(a => a.typeTransaction)));

  const FilterDropdown = ({ title, type, options }: { title: string, type: string, options: string[] }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setOpenFilter(openFilter === type ? null : type)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm ${
            filters[type as keyof FilterState] 
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <span className="text-sm font-medium">{title}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === type ? 'rotate-180' : ''}`} />
        </button>
        
        {openFilter === type && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-3">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {options.map(option => (
                <label key={option} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={type}
                    value={option}
                    checked={filters[type as keyof FilterState] === option}
                    onChange={(e) => {
                      updateFilter(type as keyof FilterState, e.target.value);
                    }}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {filters[type as keyof FilterState] && (
              <button 
                onClick={() => updateFilter(type as keyof FilterState, '')}
                className="w-full mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Fonction pour fermer les dropdowns en cliquant en dehors
  const handleOverlayClick = () => {
    setOpenFilter(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Barre de filtres principale */}
      <div className="backdrop-blur-md bg-white border-b border-gray-300 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Type de transaction */}
            <FilterDropdown 
              title="Transaction" 
              type="typeTransaction" 
              options={typesTransaction} 
            />

            {/* Type de bien */}
            <FilterDropdown 
              title="Type de bien" 
              type="typeBien" 
              options={typesBien} 
            />

            {/* Ville */}
            <FilterDropdown 
              title="Ville" 
              type="ville" 
              options={villes} 
            />

            {/* Prix */}
            <div className="relative">
              <button 
                onClick={() => setOpenFilter(openFilter === 'prix' ? null : 'prix')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all shadow-sm ${
                  (filters.prixMin > 0 || filters.prixMax < 100000000) 
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-medium">Prix</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === 'prix' ? 'rotate-180' : ''}`} />
              </button>
              
              {openFilter === 'prix' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Prix max: {filters.prixMax.toLocaleString('fr-FR')} DA
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100000000"
                        step="1000000"
                        value={filters.prixMax}
                        onChange={(e) => updateFilter('prixMax', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 DA</span>
                        <span>100M DA</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filtres avancés */}
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${
                showAdvancedFilters 
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filtres avancés</span>
            </button>

            {/* Reset filters */}
            {(filters.typeTransaction || filters.typeBien || filters.ville || filters.prixMax < 100000000) && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
                Effacer tout
              </button>
            )}
          </div>

          {/* Filtres avancés détaillés */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Surface */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={filters.surfaceMax}
                    onChange={(e) => updateFilter('surfaceMax', Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
                  />
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    Jusqu'à {filters.surfaceMax} m²
                  </div>
                </div>

                {/* Pièces */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pièces minimum
                  </label>
                  <select
                    value={filters.piecesMin}
                    onChange={(e) => updateFilter('piecesMin', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[0,1,2,3,4,5].map(num => (
                      <option key={num} value={num}>
                        {num === 0 ? 'Toutes' : `${num}+ pièces`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chambres */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chambres minimum
                  </label>
                  <select
                    value={filters.chambresMin}
                    onChange={(e) => updateFilter('chambresMin', Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {[0,1,2,3,4].map(num => (
                      <option key={num} value={num}>
                        {num === 0 ? 'Toutes' : `${num}+ chambres`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-end space-x-2">
                  <button
                    onClick={resetFilters}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Réinitialiser
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay pour fermer les dropdowns - SEULEMENT quand on clique dessus */}
      {openFilter && (
        <div 
          className="fixed inset-0 z-10 bg-black/10 backdrop-blur-[1px]" 
          onClick={handleOverlayClick}
        />
      )}       
               
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* En-tête avec compteur */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Annonces Immobilier 
            </h1>
            <p className="text-gray-600">
              {filteredAnnonces.length.toLocaleString('fr-FR')} annonces
              {filteredAnnonces.length !== immobilierExamples.length && 
                ` sur ${immobilierExamples.length.toLocaleString('fr-FR')}`
              }
            </p>
          </div>
          
          {/* Badges des filtres actifs */}
          <div className="flex flex-wrap gap-2">
            {filters.typeTransaction && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.typeTransaction}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('typeTransaction', '')}
                />
              </span>
            )}
            {filters.typeBien && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.typeBien}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('typeBien', '')}
                />
              </span>
            )}
            {filters.ville && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.ville}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilter('ville', '')}
                />
              </span>
            )}
          </div>
        </div>

        {/* Liste des annonces (le reste du code reste identique) */}
        <div className="space-y-4">
          {filteredAnnonces.map((annonce) => (
            <div
              key={annonce.id}
              className="bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative md:w-72 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={annonce.images[0]}
                    alt={annonce.typeBien}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {annonce.typeTransaction === "Location" ? (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        À louer
                      </div>
                    ) : (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        À vendre
                      </div>
                    )}
                    {annonce.logementDetails?.meuble && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        Meublé
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFavorite(annonce.id)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all shadow-sm"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        favorites.includes(annonce.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-600 hover:text-red-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {annonce.typeBien}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {annonce.localisation.adresse && `${annonce.localisation.adresse}, `}
                          {annonce.localisation.ville}
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(annonce.prix, annonce.typeTransaction)}
                    </p>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {annonce.description}
                  </p>

                  {/* Caractéristiques */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="font-semibold text-gray-900">{annonce.surface} m²</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="font-semibold text-gray-900">{annonce.pieces} pièces</span>
                    </div>
                    {annonce.logementDetails?.chambres && (
                      <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="font-semibold text-gray-900">{annonce.logementDetails.chambres} chambres</span>
                      </div>
                    )}
                    {annonce.dateConstruction && (
                      <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-gray-700">Construit en {annonce.dateConstruction}</span>
                      </div>
                    )}
                  </div>

                  {/* Équipements */}
                  <div className="flex flex-wrap gap-2">
                    {annonce.logementDetails?.ascenseur && (
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        Ascenseur
                      </span>
                    )}
                    {annonce.logementDetails?.jardin?.present && (
                      <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                        Jardin {annonce.logementDetails.jardin.surface}m²
                      </span>
                    )}
                    {annonce.logementDetails?.parking?.present && (
                      <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                        Parking
                      </span>
                    )}
                    {annonce.logementDetails?.balcon?.present && (
                      <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-xs font-medium">
                        Balcon
                      </span>
                    )}
                    {annonce.logementDetails?.terrasse?.present && (
                      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                        Terrasse {annonce.logementDetails.terrasse.surface}m²
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredAnnonces.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider-blue::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}