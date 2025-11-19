"use client";

import { useState } from "react";
import { useParams } from "next/navigation"; // récupérer l'ID depuis l'URL
import { MapPin, Maximize2, Home, BedDouble, Bath, Car, Flame, Leaf, Calendar } from "lucide-react";
import immobilierExamples from "@/app/Data/immobilierExamples"; // ton tableau d'exemples
import { ImmobilierItem } from "@/app/Data/immobilier"; // types

export default function ImmobilierDetail() {
  const { id } = useParams(); // récupère l'id depuis l'URL
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Trouver le bien correspondant à l'ID
  const item: ImmobilierItem | undefined = immobilierExamples.find(b => b.id === id);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Bien immobilier non trouvé
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne Gauche - Images et Détails */}
          <div className="lg:col-span-2 space-y-4">

            {/* Galerie d'images */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative h-96 bg-black">
                <img
                  src={item.images[selectedImage]}
                  alt="Photo principale"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
                  {selectedImage + 1} / {item.images.length}
                </div>
              </div>

              {/* Miniatures */}
              <div className="flex gap-2 p-4 overflow-x-auto">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-orange-500" : "border-gray-200"
                    }`}
                  >
                    <img src={img} alt={`Vue ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Surface */}
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Surface</p>
                    <p className="font-semibold text-gray-900">{item.surface} m²</p>
                  </div>
                </div>

                {/* Pièces */}
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Pièces</p>
                    <p className="font-semibold text-gray-900">{item.pieces}</p>
                  </div>
                </div>

                {/* Chambres */}
                {item.logementDetails?.chambres && (
                  <div className="flex items-center gap-3">
                    <BedDouble className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Chambres</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.chambres}</p>
                    </div>
                  </div>
                )}

                {/* Salles de bain */}
                {item.logementDetails?.sallesDeBain && (
                  <div className="flex items-center gap-3">
                    <Bath className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Salles de bain</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.sallesDeBain}</p>
                    </div>
                  </div>
                )}

                {/* Terrasse */}
                {item.logementDetails?.terrasse?.present && (
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Terrasse</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.terrasse.surface} m²</p>
                    </div>
                  </div>
                )}

                {/* Jardin */}
                {item.logementDetails?.jardin?.present && (
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Jardin</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.jardin.surface} m²</p>
                    </div>
                  </div>
                )}

                {/* Parking */}
                {item.logementDetails?.parking?.present && (
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Parking</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.parking.places} place(s)</p>
                    </div>
                  </div>
                )}

                {/* Chauffage */}
                {item.logementDetails?.chauffage && (
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Chauffage</p>
                      <p className="font-semibold text-gray-900">{item.logementDetails.chauffage}</p>
                    </div>
                  </div>
                )}

                {/* Date Construction */}
                {item.dateConstruction && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Construction</p>
                      <p className="font-semibold text-gray-900">{item.dateConstruction}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* DPE / GES */}
              {item.logementDetails?.dpe && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Diagnostics énergétiques</h3>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">DPE:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        {item.logementDetails.dpe}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">GES:</span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        {item.logementDetails.ges}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne Droite - Infos et Contact */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-6 space-y-4">

              {/* Prix */}
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {item.prix.toLocaleString("fr-FR")} €
                </p>
                <p className="text-sm text-gray-500 mt-1">{item.typeTransaction}</p>
              </div>

              {/* Titre */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {item.typeBien}
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{item.localisation.ville} ({item.localisation.codePostal})</span>
                </div>
              </div>

              {/* Bouton Contact */}
              <button
                onClick={() => setLoading(true)}
                disabled={loading}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </span>
                ) : (
                  "Contacter l'agence"
                )}
              </button>

              {/* Info complémentaire */}
              <div className="pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
                <p>📞 Appelez-nous pour plus d'informations</p>
                <p>🏠 Visite virtuelle disponible</p>
                <p>📅 Disponible immédiatement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
