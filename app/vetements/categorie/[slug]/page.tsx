"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { vetementsProducts } from "@/app/Data/products-vetements";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
    const params = useParams();
    // Ensure slug is a string
    const slug = typeof params.slug === 'string' ? params.slug : '';

    // Filter products based on category (case insensitive)
    const categoryProducts = vetementsProducts.filter(
        (product) => product.category?.toLowerCase() === slug.toLowerCase()
    );

    // Capitalize first letter for display
    const categoryTitle = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Vêtements {categoryTitle}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {categoryProducts.length} articles trouvés
                        </p>
                    </div>
                </div>

                {/* Product Grid */}
                {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryProducts.map((product) => (
                            <Link
                                key={product.id}
                                href={`/vetements/${product.id}`}
                                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                                    <img
                                        src={product.photos[0]}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.deliveryAvailable && (
                                        <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                                            Livraison possible
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm">
                                            {product.title}
                                        </h3>
                                        <p className="font-bold text-indigo-600 whitespace-nowrap">
                                            {product.price}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <img
                                            src={product.sellerAvatar}
                                            alt={product.sellerName}
                                            className="w-5 h-5 rounded-full"
                                        />
                                        <span className="text-xs text-gray-500 truncate">
                                            {product.sellerName}
                                        </span>
                                        <div className="flex items-center gap-0.5 text-xs text-yellow-500 ml-auto">
                                            <span>★</span>
                                            <span className="text-gray-600">{product.sellerRating}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-3">
                                        <span>{product.size}</span>
                                        <span>{product.brand}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <div className="text-6xl mb-4">👕</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Aucun article trouvé
                        </h2>
                        <p className="text-gray-500">
                            Désolé, nous n'avons pas trouvé de vêtements dans la catégorie "{categoryTitle}".
                        </p>
                        <Link
                            href="/"
                            className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Retour à l'accueil
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
