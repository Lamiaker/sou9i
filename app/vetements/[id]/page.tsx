"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Package, Truck } from "lucide-react";

// Données de démonstration
const demoItem = {
  id: "1",
  title: "Veste en Jean Vintage",
  price: 4500,
  category: "Femme",
  type: "Veste",
  size: "M",
  brand: "Levi's",
  condition: "Très bon état",
  color: "Bleu denim",
  material: "100% Coton",
  location: "Alger Centre",
  publishedAt: "15 Nov 2025",
  description: "Magnifique veste en jean vintage de la marque Levi's. Portée quelques fois seulement, dans un état impeccable. Coupe parfaite et intemporelle qui s'adapte à tous les styles.",
  deliveryMethods: ["Livraison à domicile", "Point relais", "Remise en main propre"],
  photos: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=600&fit=crop"
  ]
};

export default function ClothingDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const item = demoItem;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.photos.length) % item.photos.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Section Images avec Slider */}
            <div className="relative bg-slate-900 group">
              <div className="aspect-square md:aspect-auto md:h-full relative overflow-hidden">
                <img
                  src={item.photos[currentImageIndex]}
                  alt={`${item.title} - Photo ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Boutons de navigation */}
                {item.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-6 h-6 text-slate-900" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-6 h-6 text-slate-900" />
                    </button>
                  </>
                )}

                {/* Indicateurs de pagination */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {item.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "w-8 bg-white"
                          : "w-2 bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Compteur d'images */}
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {item.photos.length}
                </div>
              </div>

              {/* Miniatures */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {item.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-white scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Informations */}
            <div className="p-8 md:p-12 flex flex-col">
              {/* En-tête */}
              <div className="flex-1">
                <div className="inline-block px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                  {item.category}
                </div>
                
                <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
                  {item.title}
                </h1>
                
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-5xl font-bold text-indigo-600">
                    {item.price.toLocaleString()}
                  </span>
                  <span className="text-2xl text-slate-600">DA</span>
                </div>

                {/* Badges d'information */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{item.publishedAt}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>

                {/* Caractéristiques */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Type", value: item.type },
                    { label: "Taille", value: item.size },
                    { label: "Marque", value: item.brand },
                    { label: "État", value: item.condition },
                    { label: "Couleur", value: item.color },
                    { label: "Matière", value: item.material }
                  ].map((spec) => (
                    <div key={spec.label} className="bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">{spec.label}</p>
                      <p className="font-semibold text-slate-900">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Modes de livraison */}
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Modes de livraison</h2>
                  </div>
                  <div className="space-y-2">
                    {item.deliveryMethods.map((method) => (
                      <div
                        key={method}
                        className="flex items-center gap-3 bg-green-50 border border-green-200 p-3 rounded-lg"
                      >
                        <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-900 font-medium">{method}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bouton d'action */}
              <div className="mt-8 pt-6 border-t">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-indigo-600/30">
                  Contacter le vendeur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}