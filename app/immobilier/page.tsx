"use client";
import { useState } from 'react';
import { MapPin, Heart } from 'lucide-react';

import immobilierExamples from '@/app/Data/immobilierExamples';
import { useFilter } from '@/hooks/useFilter';
import { FilterBar, FilterConfig } from '@/components/shared/FilterBar';

export default function ImmobilierListPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const villes = Array.from(new Set(immobilierExamples.map(a => a.localisation.ville)));
  const typesBien = Array.from(new Set(immobilierExamples.map(a => a.typeBien)));
  const typesTransaction = Array.from(new Set(immobilierExamples.map(a => a.typeTransaction)));

  const { filters, updateFilter, resetFilters, filteredData: filteredAnnonces } = useFilter(
    immobilierExamples,
    {
      search: '',
      typeTransaction: '',
      typeBien: '',
      ville: '',
      prixMax: 100000000,
      surfaceMax: 500,
      piecesMin: 0,
      chambresMin: 0,
    },
    (annonce, filters) => {
      // Search logic
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          annonce.typeBien.toLowerCase().includes(searchLower) ||
          (annonce.description && annonce.description.toLowerCase().includes(searchLower)) ||
          annonce.localisation.ville.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.typeTransaction && annonce.typeTransaction !== filters.typeTransaction) {
        return false;
      }
      if (filters.typeBien && annonce.typeBien !== filters.typeBien) {
        return false;
      }
      if (filters.ville && annonce.localisation.ville !== filters.ville) {
        return false;
      }
      if (annonce.prix > filters.prixMax) {
        return false;
      }
      if (annonce.surface > filters.surfaceMax) {
        return false;
      }
      if (annonce.pieces < filters.piecesMin) {
        return false;
      }
      if (filters.chambresMin > 0 && annonce.logementDetails?.chambres) {
        if (annonce.logementDetails.chambres < filters.chambresMin) {
          return false;
        }
      }
      return true;
    }
  );

  const filterConfigs: FilterConfig[] = [
    { key: 'search', label: 'Rechercher', type: 'text', placeholder: 'Rechercher un bien...' },
    { key: 'typeTransaction', label: 'Type de transaction', type: 'select', options: typesTransaction, defaultValue: '' },
    { key: 'typeBien', label: 'Type de bien', type: 'select', options: typesBien, defaultValue: '' },
    { key: 'ville', label: 'Ville', type: 'select', options: villes, defaultValue: '' },
    { key: 'prixMax', label: 'Prix', type: 'range', min: 0, max: 100000000, step: 1000000, unit: 'DA', defaultValue: 100000000 },
    { key: 'surfaceMax', label: 'Surface', type: 'range', min: 0, max: 500, step: 10, unit: 'm²', advanced: true, defaultValue: 500 },
    { key: 'piecesMin', label: 'Pièces min.', type: 'number', min: 0, max: 10, advanced: true, defaultValue: 0 },
    { key: 'chambresMin', label: 'Chambres min.', type: 'number', min: 0, max: 10, advanced: true, defaultValue: 0 },
  ];

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

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Barre de filtres principale */}
      <div className="backdrop-blur-md bg-white border-b border-gray-300 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <FilterBar
            filters={filters}
            configs={filterConfigs}
            onUpdate={updateFilter}
            onReset={resetFilters}
          />
        </div>
      </div>

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
        </div>

        {/* Liste des annonces */}
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
                      className={`w-5 h-5 transition-colors ${favorites.includes(annonce.id)
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
    </div>
  );
}