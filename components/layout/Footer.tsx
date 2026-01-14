"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

export default function Footer() {
    const { categories } = useCategories();
    const displayedCategories = categories?.slice(0, 4) || [];

    return (
        <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 lg:pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand & Description */}
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">SweetLook</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            La marketplace de petites annonces ouverte à tous en Algérie. Découvrez des services, articles et prestations du quotidien dans un espace sécurisé et convivial.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Liens Rapides</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link href="/search" className="hover:text-white transition-colors">
                                    Toutes les annonces
                                </Link>
                            </li>
                            <li>
                                <Link href="/deposer" className="hover:text-white transition-colors">
                                    Déposer une annonce
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-white transition-colors">
                                    Mon compte
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories - Dynamic */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Catégories</h4>
                        <ul className="space-y-2 text-sm">
                            {displayedCategories.map((category) => (
                                <li key={category.id}>
                                    <Link href={`/categories/${category.slug}`} className="hover:text-white transition-colors">
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/categories" className="inline-flex items-center gap-1 text-primary hover:text-white transition-colors font-medium">
                                    En savoir plus
                                    <ChevronRight size={14} />
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={18} className="shrink-0 text-primary" />
                                <span>Oran, Algérie</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={18} className="shrink-0 text-primary" />
                                <Link href="/dashboard/support" className="hover:text-white transition-colors">
                                    Contactez-nous via la page support
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>&copy; {new Date().getFullYear()} SweetLook. Tous droits réservés.</p>
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        <Link href="/conditions" className="hover:text-white transition-colors">
                            Conditions d'utilisation
                        </Link>
                        <Link href="/confidentialite" className="hover:text-white transition-colors">
                            Confidentialité
                        </Link>
                        <Link href="/faq" className="hover:text-white transition-colors">
                            FAQ
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
